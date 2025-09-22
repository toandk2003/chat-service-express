const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const s3Config = require("../config/S3Config");
const S3_CONSTANTS = require("../common/constant/S3Constant");
const { User } = require("../models/User");
const Attachment = require("../models/Attachment");

class UploadFileService {
  constructor() {
    this.s3Client = s3Config.getS3Client();
  }

  async uploadFile(fileData, bucketName, currentUser) {
    try {
      // Validate input
      await this.validate(currentUser, fileData);

      // Generate presigned URL and save attachment
      return await this.save(currentUser, fileData, bucketName);
    } catch (error) {
      console.error("Error in uploadFile:", error.message);

      return {
        success: false,
        status: 400,
        message: error.message,
      };
    }
  }

  async validate(currentUser, fileData) {
    const { originalname, size, mimetype } = fileData;
    const userId = currentUser.id;

    // Validate file size
    if (size <= 0 || size > S3_CONSTANTS.MAX_LIMIT_RESOURCE) {
      throw new Error(
        `File size exceeds limit. Max: ${S3_CONSTANTS.MAX_LIMIT_RESOURCE}, Current: ${size}`
      );
    }

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

    const user = await User.findOne({ userId });
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
      user.currentUsageResourceMedia = 0;
      user.lastUpdateLimitResourceTime = now;
      await user.save();
    }

    // Check if exceeds limit
    if (
      user.currentUsageResourceMedia + size >
      S3_CONSTANTS.MAX_LIMIT_RESOURCE
    ) {
      throw new Error("Resource usage limit exceeded");
    }

    console.log("Validation passed for file upload");
  }

  async save(currentUser, fileData, bucketName) {
    const { originalname, size, mimetype } = fileData;

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
        "uploaded-by": currentUser.id.toString(),
        "upload-timestamp": timestamp.toString(),
      },
    });

    // Generate presigned PUT URL
    const presignedUrl = await getSignedUrl(this.s3Client, putObjectCommand, {
      expiresIn: Math.floor(
        S3_CONSTANTS.PRESIGN_URL_UPLOAD_MEDIA_EXPIRE_TIME / 1000
      ), // seconds
    });

    console.log("presignedUrl:", presignedUrl);

    // Save attachment to database (bạn cần implement này)
    const attachment = await Attachment.create({
      originalFileName: originalname,
      fileSize: size,
      bucket: bucketName,
      contentType: mimetype,
      key: fileNameInS3,
      status: "WAITING_CONFIRM",
      createdAt: new Date(),
      uploadedAt: new Date(),
      deletedAt: null,
    });

    // // Update limit resource
    const user = await User.findOne({ userId: currentUser.id });

    user.currentUsageResourceMedia += size;
    user.lastUpdateLimitResourceTime = new Date();
    await user.save();

    return {
      success: true,
      status: 200,
      message:
        "Presigned URL generated successfully, using it to upload file for chat",
      data: {
        id: attachment._id,
        uploadUrl: presignedUrl,
        originalFileName: originalname,
        fileNameInS3: fileNameInS3,
        contentType: mimetype,
        size: `${(size / (1024 * 1024)).toFixed(2)} MB`,
        method: "PUT",
        expiresIn: `${Math.floor(
          S3_CONSTANTS.PRESIGN_URL_UPLOAD_MEDIA_EXPIRE_TIME / 1000 / 60
        )} minutes`,
      },
    };
  }
}

module.exports = new UploadFileService();
