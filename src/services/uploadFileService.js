const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const s3Config = require("../config/S3Config");
const S3_CONSTANTS = require("../common/constant/S3Constant");
const { User } = require("../models/User");
const { Message } = require("../models/Message");

const Conversation = require("../models/Conversation");
const withTransactionThrow = require("../common/utils/withTransactionThrow");
const mongoose = require("mongoose");
class UploadFileService {
  constructor() {
    this.s3Client = s3Config.getS3Client();
  }

  async uploadFile(fileData, bucketName, email, body) {
    console.log("--start-upload-file---");
    console.log("fileData: ", fileData.length);

    console.log("bucketName: ", bucketName);

    console.log("email: ", email);

    console.log("body: ", JSON.stringify(body, null, 2));

    try {
      // Validate input

      // Generate presigned URL and save attachment
      return await this.save(email, fileData, bucketName, body);
    } catch (error) {
      console.error("Error in uploadFile:", error.message);

      return {
        success: false,
        status: 400,
        message: error.message,
      };
    }
  }

  async validate(session, email, fileData) {
    console.log("validating files......");
    fileData.forEach((file) => {
      const { originalname, size, mimetype } = file;

      // Validate file name
      if (!originalname || originalname.trim() === "") {
        throw new Error("Original file name is required");
      }

      // Validate extension
      const extension = path.extname(originalname).toLowerCase();
      if (!extension || !S3_CONSTANTS.ALLOWED_EXTENSIONS.includes(extension)) {
        throw new Error(
          `File extension not supported: ${extension}. Allowed: ${S3_CONSTANTS.ALLOWED_EXTENSIONS.join(
            ", "
          )}`
        );
      }

      // Validate content type
      if (
        !mimetype ||
        !S3_CONSTANTS.ALLOWED_CONTENT_TYPES.includes(mimetype.toLowerCase())
      ) {
        throw new Error(
          `Content type not supported: ${mimetype}. Allowed: ${S3_CONSTANTS.ALLOWED_CONTENT_TYPES.join(
            ", "
          )}`
        );
      }
    });

    let size = 0;
    fileData.forEach((file) => (size += file.size));

    //  file size
    if (size <= 0 || size > S3_CONSTANTS.MAX_LIMIT_RESOURCE) {
      throw new Error(
        `File size exceeds limit. Max: ${S3_CONSTANTS.MAX_LIMIT_RESOURCE}, Current: ${size}`
      );
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found");
    }
    const {
      maxLimitResourceMedia,
      currentUsageResourceMedia,
      lastUpdateLimitResourceTime,
    } = user;

    console.log("user limit resource:", {
      maxLimitResourceMedia,
      currentUsageResourceMedia,
      lastUpdateLimitResourceTime,
    });

    // Reset resource usage if new day
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const lastUpdate = new Date(lastUpdateLimitResourceTime)
      .toISOString()
      .split("T")[0];

    if (today > lastUpdate) {
      console.log("today > lastUpdate");
      user.currentUsageResourceMedia = 0;
      user.lastUpdateLimitResourceTime = now;
      await user.save({ session });
    }

    // Check if exceeds limit
    if (
      user.currentUsageResourceMedia + size >
      S3_CONSTANTS.MAX_LIMIT_RESOURCE
    ) {
      throw new Error("Resource usage limit exceeded");
    }

    console.log("Validation passed for file upload");

    return today > lastUpdate;
  }

  async save(email, fileData, bucketName, body) {
    return await withTransactionThrow(
      async (session, email, fileData, bucketName, body) => {
        const isUpdateUserDebitAttachment = await this.validate(
          session,
          email,
          fileData
        );

        const attachmentPromises = fileData.map(async (file) => {
          const { originalname, size, mimetype } = file;

          // Generate unique filename
          const fileExtension = path.extname(originalname);
          const timestamp = Date.now();
          const uuid = uuidv4();
          const fileNameInS3 = `${timestamp}_${uuid}_${originalname}`;

          console.log("fileNameInS3:", fileNameInS3);
          console.log("contentType:", mimetype);
          console.log("fileSize:", size);

          // Create PutObjectCommand
          const putObjectCommand = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileNameInS3,
            ContentType: mimetype,
            ContentLength: size,
            // Các metadata khác nếu cần
            Metadata: {
              "original-filename": originalname,
              "uploaded-by": email,
              "upload-timestamp": timestamp.toString(),
            },
          });

          // Generate presigned PUT URL
          const presignedUrl = await getSignedUrl(
            this.s3Client,
            putObjectCommand,
            {
              expiresIn: Math.floor(
                S3_CONSTANTS.PRESIGN_URL_UPLOAD_MEDIA_EXPIRE_TIME / 1000
              ), // seconds
            }
          );

          console.log("presignedUrl:", presignedUrl);

          return {
            presignedUrl,
            originalFileName: originalname,
            fileSize: size,
            bucket: bucketName,
            contentType: mimetype,
            key: fileNameInS3,
            status: "ACTIVE",
            createdAt: new Date(),
            uploadedAt: new Date(),
            deletedAt: null,
          };
        });

        const attachments = await Promise.all(attachmentPromises);
        console.log("attachments is : ", attachments);
        let size = 0;
        fileData.forEach((file) => (size += file.size));
        console.log("size is : ", size);

        // // Update limit resource
        const user = await User.findOne({ email });
        console.log("user is : ", JSON.stringify(user, null, 2));
        user.currentUsageResourceMedia += size;
        user.lastUpdateLimitResourceTime = new Date();

        if (isUpdateUserDebitAttachment) user.__v++;

        const conversationId = new mongoose.Types.ObjectId(body.conversationId);
        console.log(
          "conversationId: ",
          JSON.stringify(conversationId, null, 2)
        );

        // get Conversation
        const conversation = await Conversation.findById(conversationId);

        if (!conversation)
          throw new Error(
            `Conversation with id: ${conversationId} is not exists.`
          );
        console.log("conversation: ", JSON.stringify(conversation, null, 2));

        // get all receiver
        const participantIds = conversation.participants.map(
          (participant) => participant.userId
        );

        // send message to them
        console.log("participantIds: " + participantIds);

        const [_, messages] = await Promise.all([
          user.save({ session }),
          Message.insertMany(
            [
              {
                _id: new mongoose.Types.ObjectId(body.messageId),
                replyForMessgeId: new mongoose.Types.ObjectId(
                  body.originalMessageId
                ),
                conversationId: body.conversationId,
                senderId: user._id,
                recipients: participantIds.map((recipientId) => {
                  return {
                    userId: recipientId,
                  };
                }),
                content: body.content,
                type: body.messageType,
                attachments: attachments.map((attachment) => {
                  const { presignedUrl, ...remain } = attachment;
                  console.log("remainsss: ", remain);
                  return remain;
                }),
              },
            ],
            { session }
          ),
        ]);

        const response = {
          success: true,
          status: 200,
          message:
            "Presigned URL generated successfully, using it to upload file for chat",
          data: {
            ...messages[0]._doc,
            attachments,
          },
        };
        console.log("response is: ", JSON.stringify(response, null, 2));
        return response;
      },
      email,
      fileData,
      bucketName,
      body
    );
  }
}

module.exports = new UploadFileService();
