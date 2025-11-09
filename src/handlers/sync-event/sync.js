const syncConversation = require("./syncConversation");
const syncUpdateUser = require("./syncUpdateUser");
const syncUser = require("./syncUser");
const syncSendMessage = require("./syncSendMessage");
const syncNoti = require("./syncNoti");
// const syncChangeStatusSeen = require("./syncChangeStatusSeen");

const sync = async (message) => {
  try {
    const { eventType, ...data } = message;

    switch (eventType) {
      case "SYNC_USER":
        await syncUser(data);
        break;

      case "SYNC_UPDATE_USER":
        await syncUpdateUser(data);
        break;

      case "SYNC_CONVERSATION":
        await syncConversation(data);
        break;

      case "SYNC_SEND_MESSAGE":
        await syncSendMessage(data);
        break;

      case "TEST":
        console.log("WOWWWWWWWW____TESTTTTTTT: ", data);
        break;

      case "NOTI":
        await syncNoti(data);
        break;

      // case "SYNC_CHANGE_STATUS_SEEN":
      //   await syncChangeStatusSeen(data);
      //   break;

      default:
        throw new Error("NOT FOUND CURRENT EVENT TYPE: " + eventType);
    }

    console.log("📥 sync successfully:");
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = sync;
