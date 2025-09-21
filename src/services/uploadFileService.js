const { GetObjectCommand, HeadObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { createPresignedPost } = require("@aws-sdk/s3-presigned-post");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const s3Config = require("../config/S3Config");
const S3_CONSTANTS = require("../common/constant/S3Constant");

class UploadFileService {
  constructor() {
    this.s3Client = s3Config.getS3Client();
  }

  async uploadFile(fileData, bucketName, currentUser) {
    try {
      // Validate input
      // const limitResource = await this.validate(currentUser, fileData);

      // Generate presigned URL and save attachment
      return await this.save(currentUser, null, fileData, bucketName);
    } catch (error) {
      console.error("Error in uploadFile:", error.message);
      throw error;
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

    // Get user's limit resource (này bạn cần implement theo database của mình)
    const limitResource = await this.getLimitResource(userId);

    // Reset resource usage if new day
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const lastUpdate = new Date(limitResource.updatedAt)
      .toISOString()
      .split("T")[0];

    if (today > lastUpdate) {
      limitResource.currentUsage = 0;
    }

    // Check if exceeds limit
    if (limitResource.currentUsage + size > S3_CONSTANTS.MAX_LIMIT_RESOURCE) {
      throw new Error("Resource usage limit exceeded");
    }

    return limitResource;
  }
  async save(currentUser, limitResource, fileData, bucketName) {
    const { originalname, size, mimetype } = fileData;

    // Generate unique filename
    const fileExtension = path.extname(originalname);
    const timestamp = Date.now();
    const uuid = uuidv4();
    const fileNameInS3 = `${timestamp}_${uuid}_${originalname}`;

    console.log("fileNameInS3:", fileNameInS3);
    console.log("contentType:", mimetype);
    console.log("fileSize:", size);

    // Create presigned POST URL (more secure for uploads)
    const expiration = new Date(
      Date.now() + S3_CONSTANTS.PRESIGN_URL_UPLOAD_MEDIA_EXPIRE_TIME
    );

    const presignedPost = await createPresignedPost(this.s3Client, {
      Bucket: bucketName,
      Key: fileNameInS3,
      Expires: Math.floor(
        S3_CONSTANTS.PRESIGN_URL_UPLOAD_MEDIA_EXPIRE_TIME / 1000
      ),
      Fields: {
        "Content-Type": mimetype,
        "Content-Length": size.toString(),
      },
      Conditions: [
        ["content-length-range", size, size], // Exact size match
        ["eq", "$Content-Type", mimetype],
      ],
    });

    console.log("presignedPost:", presignedPost);

    // Save attachment to database (bạn cần implement này)
    // const attachment = await this.saveAttachment({
    //   originalFileName: originalname,
    //   s3BucketName: bucketName,
    //   fileNameInS3: fileNameInS3,
    //   fileSize: size,
    //   contentType: mimetype,
    //   status: "WAITING_CONFIRM",
    //   expireAt: new Date(
    //     Date.now() + S3_CONSTANTS.EXPIRE_TIME_ATTACHMENT * 24 * 60 * 60 * 1000
    //   ),
    //   createdBy: currentUser.id,
    // });

    // // Update limit resource
    // limitResource.currentUsage += size;
    // await this.updateLimitResource(limitResource);

    // return {
    //   attachmentId: attachment.id,
    //   uploadUrl: presignedPost.url,
    //   fields: presignedPost.fields,
    //   originalFileName: originalname,
    //   fileNameInS3: fileNameInS3,
    //   contentType: mimetype,
    //   size: `${(size / (1024 * 1024)).toFixed(2)} MB`,
    //   method: "POST",
    //   expiresIn: `${Math.floor(
    //     S3_CONSTANTS.PRESIGN_URL_UPLOAD_MEDIA_EXPIRE_TIME / 1000 / 60
    //   )} minutes`,
    // };
    return {
      uploadUrl: presignedPost.url,
      originalFileName: originalname,
      fileNameInS3: fileNameInS3,
      contentType: mimetype,
      size: `${(size / (1024 * 1024)).toFixed(2)} MB`,
      method: "POST",
      expiresIn: `${Math.floor(
        S3_CONSTANTS.PRESIGN_URL_UPLOAD_MEDIA_EXPIRE_TIME / 1000 / 60
      )} minutes`,
    };
  }

  // Placeholder methods - implement theo database của bạn
  async getLimitResource(userId) {
    // Implement database query to get user's limit resource
    return {
      id: 1,
      userId: userId,
      currentUsage: 0,
      updatedAt: new Date(),
    };
  }

  async saveAttachment(attachmentData) {
    // Implement database save for attachment
    return {
      id: Date.now(), // Mock ID
      ...attachmentData,
    };
  }

  async updateLimitResource(limitResource) {
    // Implement database update for limit resource
    console.log("Updated limit resource:", limitResource);
  }
}

module.exports = new UploadFileService();
