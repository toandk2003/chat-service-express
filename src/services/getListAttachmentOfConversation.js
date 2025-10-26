const { User } = require("../models/User");
const { Message } = require("../models/Message");
const createPaginateResponse = require("../common/utils/createPaginateResponse");
const {
  getMyConversationByUserIdAndConversationId,
} = require("./getMyConversation");
const genPresignURL = require("./genPresignURL");
const mongoose = require("mongoose");

const getListAttachmentOfConversation = async (req, res) => {
  try {
    console.log("\nstart-get-detail-conversation\n"); // In ra console server
    const { id } = req.params;
    const { pageSize, currentPage } = req.query;
    const limit = +pageSize;
    const skip = +currentPage * +limit;

    const conversationId = new mongoose.Types.ObjectId(id);
    console.log("conversationId is : " + conversationId);

    const email = req.currentUser.email;
    console.log("email: " + email);

    const user = await User.findOne({ email, status: "ACTIVE" });
    const userId = user._id;
    console.log("user: ", user);
    if (!user) throw new Error("USER NOT FOUND WITH ID: " + userId);

    const [ourConversation, myConversation] =
      await getMyConversationByUserIdAndConversationId(userId, conversationId);

    if (!myConversation)
      throw new Error("CONVERSATION NOT FOUND WITH ID: " + conversationId);

    const skipUntilOffset = myConversation.skipUntilOffset;
    let messages = [];

    if (myConversation.status === "running") {
      messages = await Message.find({
        _id: {
          $gt: skipUntilOffset,
        },
        conversationId,
        status: "CONFIRMED",
        type: { $in: ["image", "video", "file", "attachment"] }, // Using $in operator for multiple possible values
      }).sort({ createdAt: -1 }); // Sắp xếp giảm dần theo thời gian tạo
    }
    console.log("messages: ", messages);
    const attachments = [];

    for (const message of messages) {
      const promises = message.attachments.map(async (attachment) => {
        const presignURL = await genPresignURL(attachment.key);
        attachment._doc.presignURL = presignURL;
        return attachment; // trả lại attachment đã cập nhật
      });

      const updatedAttachments = await Promise.all(promises);
      attachments.push(...updatedAttachments);
    }

    return res.json(
      createPaginateResponse(
        true,
        200,
        "Here is attachment of your conversation",
        currentPage,
        pageSize,
        attachments.length,
        attachments.slice(skip, Math.min(skip + limit, attachments.length))
      )
    );
  } catch (error) {
    console.error(error);
    res.json({
      message: error.message,
      error: error.message,
      success: false,
      status: 500,
    });
  }
};

const getFullInfoAttachment = async (attachments) => {
  const images = [],
    videos = [],
    files = [];
  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i];
    attachment._doc.presignURL = await genPresignURL(attachment.key);

    if (
      attachment.contentType === "image/jpeg" ||
      attachment.contentType === "image/jpg" ||
      attachment.contentType === "image/png" ||
      attachment.contentType === "image/gif" ||
      attachment.contentType === "image/webp"
    ) {
      images.push(attachment);
    } else if (
      attachment.contentType === "video/mp4" ||
      attachment.contentType === "video/quicktime" ||
      attachment.contentType === "video/x-msvideo" ||
      attachment.contentType === "video/webm"
    ) {
      videos.push(attachment);
    } else files.push(attachment);
  }
  return [images, videos, files];
};

module.exports = getListAttachmentOfConversation;
