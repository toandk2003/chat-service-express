// const { HeadObjectCommand } = require("@aws-sdk/client-s3");
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
// const { GetObjectCommand } = require("@aws-sdk/client-s3");
// const path = require("path");
// const s3Config = require("../config/s3Config");
// const S3_CONSTANTS = require("../constants/s3Constants");

// class DownloadFileService {
//   constructor() {
//     this.s3Client = s3Config.getS3Client();
//   }

//   async downloadFile(fileNameInS3, bucketName) {
//     try {
//       // Check if file exists in S3
//       await this.checkFileExists(bucketName, fileNameInS3);

//       // Generate presigned URL for download
//       const expiration = Math.floor(
//         S3_CONSTANTS.PRESIGN_URL_DOWNLOAD_MEDIA_EXPIRE_TIME / 1000
//       );

//       const command = new GetObjectCommand({
//         Bucket: bucketName,
//         Key: fileNameInS3,
//       });

//       const presignedUrl = await getSignedUrl(this.s3Client, command, {
//         expiresIn: expiration,
//       });

//       return {
//         downloadUrl: presignedUrl,
//         originalFileName: fileNameInS3,
//         method: "GET",
//         expiresIn: `${Math.floor(
//           S3_CONSTANTS.PRESIGN_URL_DOWNLOAD_MEDIA_EXPIRE_TIME / 1000 / 60
//         )} minutes`,
//       };
//     } catch (error) {
//       console.error("Error in downloadFile:", error.message);
//       throw error;
//     }
//   }

//   async checkFileExists(bucketName, fileNameInS3) {
//     try {
//       const command = new HeadObjectCommand({
//         Bucket: bucketName,
//         Key: fileNameInS3,
//       });

//       await this.s3Client.send(command);
//       return true;
//     } catch (error) {
//       if (
//         error.name === "NotFound" ||
//         error.$metadata?.httpStatusCode === 404
//       ) {
//         throw new Error(`File does not exist: ${fileNameInS3}`);
//       }
//       throw error;
//     }
//   }

//   validateFile(fileNameInS3) {
//     if (!fileNameInS3 || fileNameInS3.trim() === "") {
//       throw new Error("File name is required");
//     }

//     const extension = path.extname(fileNameInS3).toLowerCase();
//     if (!extension || !S3_CONSTANTS.ALLOWED_EXTENSIONS.includes(extension)) {
//       throw new Error(
//         `File extension not supported: ${extension}. Allowed: ${S3_CONSTANTS.ALLOWED_EXTENSIONS.join(
//           ", "
//         )}`
//       );
//     }
//   }
// }

// module.exports = new DownloadFileService();
