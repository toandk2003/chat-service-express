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

    return [ourConversation, otherConversation];
  } catch (error) {
    console.error(error);
    return null;
  }
};
module.exports = {
  getOtherConversationByUserIdAndConversationId,
  getMyConversationByUserIdAndConversationId,
};
