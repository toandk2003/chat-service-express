const syncConversation = require("./syncConversation");
const syncUser = require("./syncUser");

const sync = async (message) => {
  try {
    const { eventType, ...data } = message;

    switch (eventType) {
      case "SYNC_USER":
        await syncUser(data);
        break;

      case "SYNC_CONVERSATION":
        await syncConversation(data);
        break;

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
