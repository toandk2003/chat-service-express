const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { GetObjectCommand } = require("@aws-sdk/client-s3");
const S3_CONSTANTS = require("../common/constant/S3Constant");
const s3Config = require("../config/S3Config");

const genPresignURL = async (Key) => {
  console.log("Key S3 IS: ", Key);
  if (!Key) throw new Error("Key S3 IS MISSING");
  const s3Client = s3Config.getS3Client();
  const getObjectCommand = new GetObjectCommand({
    Bucket: S3_CONSTANTS.AVATAR_PRIVATE_BUCKET,
    Key,
  });

  // Tạo GET presigned URL với thời gian hết hạn dài hơn
  return await getSignedUrl(s3Client, getObjectCommand, {
    expiresIn: 86400, // URL hết hạn sau 24 giờ
  });
};

module.exports = genPresignURL;
