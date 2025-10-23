const { User } = require("../../models/User");
const genPresignURL = require("../../services/genPresignURL");
const convertMessageToLongFormat = async (message) => {
  const [sender, attachments] = await Promise.all([
    User.findOne(message.senderId),
    getFullInfoAttachment(message.attachments),
  ]);
  if (!sender) throw new Error("NOT FOUND SENDER WITH ID: ", message.senderId);

  const [images, videos, files] = attachments;

  return {
    sender: {
      _id: sender._id,
      fullName: sender.fullName,
      email: sender.email,
      profilePic: await genPresignURL(sender.avatar),
    },
    message: {
      _id: message._id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      type: message.type,
      attachments: {
        images,
        videos,
        files,
      },
    },
  };
};

const getFullInfoAttachment = async (attachments) => {
  const images = [],
    videos = [],
    files = [];
  for (let i = 0; i < attachments.length; i++) {
    const attachment = attachments[i];
    attachment.presignURL = await genPresignURL(attachment.key);

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

module.exports = convertMessageToLongFormat;
