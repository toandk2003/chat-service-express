const SynchronizePublisher = require("../messageBroker/synchronizePublisher");
const Event = require("../models/event");
const ResumeToken = require("../models/resumeToken");

class EventChangeStreamService {
  constructor(synchronizePublisher) {
    this.synchronizePublisher = synchronizePublisher;
  }

  /**
   * Lấy resume token từ database
   */

  static async getInstance() {
    const synchronizePublisher = await SynchronizePublisher.getInstance();
    return new EventChangeStreamService(synchronizePublisher);
  }

  async getResumeToken() {
    try {
      const tokenDoc = await ResumeToken.findOne({});
      return tokenDoc ? tokenDoc.token : null;
    } catch (error) {
      console.error("❌ Error getting resume token:", error);
      return null;
    }
  }

  /**
   * Lưu resume token vào database
   */
  async saveResumeToken(token) {
    try {
      await ResumeToken.findOneAndUpdate(
        {},
        {
          token,
        },
        { upsert: true, new: true }
      );
      console.log("✅ Resume token saved");
    } catch (error) {
      console.error("❌ Error saving resume token:", error);
    }
  }

  /**
   * Khởi động Change Stream
   */
  async start() {
    try {
      // Lấy resume token nếu có
      const resumeToken = await this.getResumeToken();

      const pipeline = [
        {
          $match: {
            operationType: { $in: ["insert"] },
          },
        },
      ];
      const options = resumeToken ? { resumeAfter: resumeToken } : {};

      // Tạo change stream
      const changeStream = Event.watch(pipeline, options);

      console.log("👀 Change Stream started, watching events collection...");

      // Lắng nghe các thay đổi
      changeStream.on("change", async (change) => {
        try {
          await this.handleChange(change);

          // Lưu resume token sau mỗi lần xử lý thành công
          await this.saveResumeToken(change._id);
        } catch (error) {
          console.error("❌ Error handling change:", error);
        }
      });

      // Xử lý lỗi
      changeStream.on("error", async (error) => {
        console.error("❌ Change Stream error:", error);

        // Tự động restart sau 5 giây
        setTimeout(() => {
          console.log("🔄 Restarting Change Stream...");
          this.start();
        }, 5000);
      });

      changeStream.on("close", () => {
        console.log("⚠️ Change Stream closed");
      });
    } catch (error) {
      console.error("❌ Failed to start Change Stream:", error);
      throw error;
    }
  }

  /**
   * Xử lý khi có thay đổi trong collection
   */
  async handleChange(change) {
    const { fullDocument } = change;
    const { payload, destination } = fullDocument;

    try {
      // Publish lên Redis Stream
      const event = {
        destination,
        payload,
      };
      await this.synchronizePublisher.publish(event);

      console.log(
        `✅ Event ${fullDocument._id} processed and sent at ${new Date()}`
      );
    } catch (error) {
      console.error(`❌ Error processing event ${fullDocument._id}:`, error);
      throw error;
    }
  }
}

module.exports = EventChangeStreamService;
