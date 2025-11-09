// const mongoose = require("mongoose");
// const {
//   getMyConversationByUserIdAndConversationId,
// } = require("../../services/getMyConversation");

// const syncChangeStatusSeen = async (message) => {
//   console.log("syncChangeStatusSeen.....");
//   console.log("message: " + JSON.stringify(message, null, 2));

//   const { userId, conversationId, messageId, __v } = message;

//   const convId = new mongoose.Types.ObjectId(conversationId);
//   const lastReadOffset = new mongoose.Types.ObjectId(messageId);
//   const [ourConversation, myConversation] =
//     await getMyConversationByUserIdAndConversationId(userId, convId);

//   console.log("myConversation: ", myConversation);
  
//   myConversation.lastReadOffset = lastReadOffset;
//   myConversation.unreadMessageNums = 0;

//   await ourConversation.save();
// };

// module.exports = syncChangeStatusSeen;
