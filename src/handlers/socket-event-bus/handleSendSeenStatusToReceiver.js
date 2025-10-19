const mongoose = require("mongoose");

const handleSendSeenStatusToReceiver = async (payload) => {
  console.log(
    "\n\n Sending seen status to multi receiver----------------------------\n\n"
  );
  const { user, ourConversation, myConversation } = payload;
  console.log(
    "ourConversation.participants is: ",
    JSON.stringify(ourConversation.participants, null, 2)
  );

  const userId = user._id;

  const otherConversation = ourConversation.participants.forEach(
    (participant) => {
      const isSent = participant.userId !== userId;

      console.log("participant.userId: ", participant.userId);
      console.log("userId: ", userId);
      console.log("isSent: ", isSent);

      if (isSent) {
        global.io
          .to(participant.userId.toString())
          .emit("receive_seen_status", {
            newSeenStatus: {
              conversationId: ourConversation._id,
              myConversation,
            },
          });
      }
    }
  );
};
module.exports = handleSendSeenStatusToReceiver;
