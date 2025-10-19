const Conversation = require("../models/Conversation");

const getMyConversationByUserIdAndConversationId = async (
  userId,
  conversationId
) => {
  try {
    const ourConversation = await Conversation.findById(conversationId);
    const myConversation = ourConversation.participants.find((participant) =>
      participant.userId.equals(userId)
    );
    if (!ourConversation || !myConversation)
      throw new Error(
        "NO EXISTS CONVERSATION WITH USERID AND CONVERSATIONID = " +
          userId +
          ", " +
          conversationId
      );
    console.log("myConversation: ", JSON.stringify(myConversation, null, 2));
    return [ourConversation, myConversation];
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getMyConversationByUserIdAndPartnerId = async (userId, partnerId) => {
  try {
    const ourConversation = await Conversation.findOne({
      type: "private",
      "participants.userId": { $all: [userId, partnerId] },
      status: "active", // Only find active conversations
    });

    const myConversation = ourConversation.participants.find((participant) =>
      participant.userId.equals(userId)
    );
    if (!ourConversation || !myConversation)
      throw new Error(
        "NO EXISTS CONVERSATION WITH USERID AND partnerId = " +
          userId +
          ", " +
          partnerId
      );
    console.log("myConversation: ", JSON.stringify(myConversation, null, 2));
    return [ourConversation, myConversation];
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getOtherConversationByUserIdAndConversationId = async (
  userId,
  conversationId
) => {
  try {
    console.log("userId: ", userId);
    console.log("conversationId: ", conversationId);

    const ourConversation = await Conversation.findById(conversationId);
    const otherConversation = ourConversation.participants.filter(
      (participant) => {
        const bool = !participant.userId.equals(userId);
        console.log("participant.userId: ", participant.userId);
        console.log("userId: ", userId);
        return bool;
      }
    );
    console.log(
      "otherConversation: ",
      JSON.stringify(otherConversation, null, 2)
    );
    if (!ourConversation || !otherConversation)
      throw new Error(
        "NO EXISTS CONVERSATION WITH USERID AND conversationID = " +
          userId +
          ", " +
          conversationId
      );

    return [ourConversation, otherConversation];
  } catch (error) {
    console.error(error);
    return null;
  }
};
module.exports = {
  getOtherConversationByUserIdAndConversationId,
  getMyConversationByUserIdAndConversationId,
  getMyConversationByUserIdAndPartnerId,
};
