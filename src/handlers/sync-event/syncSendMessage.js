const Conversation = require("../../models/Conversation");
const createEvent = require("../../common/utils/createEventEntity");

const mongoose = require("mongoose");
const Event = require("../../models/event");

const syncSendMessage = async (data) => {
  console.log("syncing sendMessage.....");
  // const { user } = data;

  // const userId = new mongoose.Types.ObjectId(user._id);

  // console.log("data: ", JSON.stringify(data, null, 2));

  // const conversationId = new mongoose.Types.ObjectId(data.conversationId);
  // console.log("conversationId: ", JSON.stringify(conversationId, null, 2));

  // // get Conversation
  // const conversation = await Conversation.findById(conversationId);

  // if (!conversation)
  //   throw new Error(`Conversation with id: ${conversationId} dont exists.`);
  // console.log("conversation: ", JSON.stringify(conversation, null, 2));

  // // get all receiver
  // const participantIds = conversation.participants
  //   .filter((participant) => !participant.userId.equals(userId))
  //   .map((participant) => participant.userId);

  // // send message to them
  // console.log("participants: " + participantIds);

  // participantIds.forEach((participantId) => {
  //   global.io
  //     .to(participantId.toString())
  //     .emit("receive_message", { content: " WOWWWWWWWW" });
  // });
  // const event = createEvent({
  //   eventType: "SEND_MESSAGE_EVENT_BUS",
  //   ...data,
  // });

  // await Event.create(event);
};

module.exports = syncSendMessage;
