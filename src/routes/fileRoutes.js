const express = require("express");
const multer = require("multer");
const uploadFileService = require("../services/uploadFileService");
const S3_CONSTANTS = require("../common/constant/S3Constant");
// const downloadFileService = require('../services/downloadFileService');

const router = express.Router();

// Configure multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
  },
});

// Upload file endpoint
router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const originalName = req.file.originalname;
  const fileSize = req.file.size;

  console.log("Original file name:", originalName);
  console.log("File size (bytes):", fileSize);

  res.json(
    await uploadFileService.uploadFile(
      req.file,
      S3_CONSTANTS.CHAT_MEDIA_BUCKET,
      req.currentUser
    )
  );
});

// // Download file endpoint
// router.get('/download/:fileName', async (req, res) => {
//     try {
//         const { fileName } = req.params;
//         const bucketName = req.query.bucketName || process.env.AWS_BUCKET_NAME;

//         const result = await downloadFileService.downloadFile(fileName, bucketName);

//         res.json({
//             success: true,
//             data: result
//         });
//     } catch (error) {
//         res.status(400).json({
//             success: false,
//             error: error.message
//         });
//     }
// });

module.exports = router;
