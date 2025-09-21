const { S3Client } = require("@aws-sdk/client-s3");

class S3Config {
  constructor() {
    this.accessKey = process.env.AWS_ACCESS_KEY;
    this.secretKey = process.env.AWS_SECRET_KEY;
    this.region = process.env.AWS_REGION;
    this.endpoint = process.env.AWS_ENDPOINT;

    if (!this.accessKey || !this.secretKey || !this.region) {
      throw new Error("Missing AWS credentials or region");
    }
  }

  getS3Client() {
    const config = {
      region: this.region,
      credentials: {
        accessKeyId: this.accessKey,
        secretAccessKey: this.secretKey,
      },
    };

    // If endpoint is provided (MinIO), use it
    if (this.endpoint && this.endpoint.trim() !== "") {
      config.endpoint = this.endpoint;
      config.forcePathStyle = true; // MinIO requires path-style
    }
    const s3Client = new S3Client(config);
    console.log("S3 Config: ", config);

    return s3Client;
  }
}

module.exports = new S3Config();
