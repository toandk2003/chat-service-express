const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
import { GetObjectCommand } from "@aws-sdk/client-s3";
import S3_CONSTANTS from "../common/constant/S3Constant";
const s3Config = require("../config/S3Config");

const genPresignURL = async (key) => {
  const s3Client = s3Config.getS3Client();
  const getObjectCommand = new GetObjectCommand({
    Bucket: S3_CONSTANTS.CHAT_MEDIA_BUCKET,
    key,
  });

  // Tạo GET presigned URL với thời gian hết hạn dài hơn
  return await getSignedUrl(s3Client, getObjectCommand, {
    expiresIn: 86400, // URL hết hạn sau 24 giờ
  });
};

module.exports = genPresignURL;
