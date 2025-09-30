const { User } = require("../models/User");
const UserConversation = require("../models/UserConversation");
const countTotal = require("../common/utils/countTotal");
const queryDocument = require("../common/utils/queryDocument");
const createPaginateResponse = require("../common/utils/createPaginateResponse");
const Conversation = require("../models/Conversation");
const { Message } = require("../models/Message");
const ConversationName = require("../models/ConversationName");

const conversationController = {
  getList: async (req, res) => {
    try {
      const { name, pageSize, currentPage, avoidConversationIds } = req.query;
      const email = req.currentUser.email;
      console.log("email: " + email);
      console.log("req: ", req.query);

      const user = await User.findOne({ email, status: "ACTIVE" });

      const conv = await Conversation.find();
      const firstConv = conv[0];
      const secondConv = conv[1];

      await Message.insertMany([
        { conversationId: firstConv._id },
        { conversationId: secondConv._id },
      ]);

      if ((await ConversationName.find({})).length === 0) {
        await ConversationName.insertMany([
          { conversationId: firstConv._id, name: "abc", type: "private" },
          { conversationId: firstConv._id, name: "def", type: "private" },
          { conversationId: secondConv._id, name: "groupName", type: "group" },
          // { conversationId: firstConv._id, name: "botName", type: "bot" },
        ]);
      }
      console.log("user: ", user);
      console.log("avoidConversationIds: ", avoidConversationIds);
      const userId = user._id;
      const pipeline = [
        // Stage 1: Tìm các cuộc hội thoại của user hiện tại
        {
          $match: {
            userId,
            status: "active",
            conversationId: {
              // omit conversation
              $nin:
                Array.isArray(avoidConversationIds) &&
                avoidConversationIds.every((item) => typeof item === "string")
                  ? [...avoidConversationIds]
                  : typeof avoidConversationIds === "string"
                  ? [avoidConversationIds]
                  : [],
            },
          },
        },
        // Stage 2: Join với conversation để lấy thông tin
        {
          $lookup: {
            from: "conversations",
            localField: "conversationId",
            foreignField: "_id",
            as: "conversation",
          },
        },
        // Stage 3: Unwrap mảng conversation thành object
        {
          $unwind: "$conversation",
        },
        // Stage 4: Lọc các cuộc hội thoại active
        {
          $match: {
            "conversation.status": "active",
          },
        },
        // Stage 5: Lọc theo tên nếu có

        {
          $lookup: {
            from: "messages",
            let: { conversationId: "$conversationId" },
            pipeline: [
              // Tìm tất cả tin nhắn của conversation này
              {
                $match: {
                  $expr: { $eq: ["$conversationId", "$$conversationId"] },
                },
              },
              // Sắp xếp theo thời gian tạo (giảm dần - từ mới đến cũ)
              { $sort: { createdAt: -1 } },
              // Chỉ lấy tin nhắn mới nhất
              { $limit: 1 },
            ],
            as: "lastMessage",
          },
        },
        {
          $lookup: {
            from: "conversation_names",
            let: { conversationId: "$conversationId", userId },
            pipeline: [
              // Match dựa trên conversationId
              {
                $match: {
                  $expr: {
                    $eq: ["$conversationId", "$$conversationId"],
                  },
                },
              },
              // Lọc theo loại conversation và điều kiện về refId
              {
                $match: {
                  $expr: {
                    $or: [
                      // Trường hợp 1: Nếu type là 'private', chỉ lấy những tên với refId khác với userId
                      {
                        $and: [
                          { $eq: ["$type", "private"] },
                          { $ne: ["$refId", "$$userId"] },
                        ],
                      },
                      // Trường hợp 2: Nếu type là 'group' hoặc 'bot', lấy tất cả
                      { $in: ["$type", ["group", "bot"]] },
                    ],
                  },
                },
              },
              // Nếu có điều kiện tìm kiếm theo name
              ...(name
                ? [
                    {
                      $match: {
                        name: {
                          $regex: `.*${name.trim()}.*`,
                          $options: "i",
                        },
                      },
                    },
                  ]
                : []),
            ],
            as: "conversationNames",
          },
        },

        ...(name
          ? [
              {
                $match: {
                  conversationNames: { $ne: [] }, // Chỉ giữ lại những document mà mảng conversationNames không rỗng
                },
              },
            ]
          : []),

        // Stage 7: Sắp xếp theo thời gian cập nhật mới nhất
        {
          $sort: { updatedAt: -1 },
        },
      ];

      // Thực hiện đếm tổng số bản ghi
      const total = await countTotal(UserConversation, pipeline);

      // Thêm skip và limit vào pipeline để phân trang
      const paginatedResults = await queryDocument(
        UserConversation,
        pipeline,
        pageSize,
        currentPage
      );

      // Tạo kết quả phân trang
      return res.json(
        createPaginateResponse(
          true,
          200,
          "Here is user's conversation.",
          currentPage,
          pageSize,
          total,
          paginatedResults
        )
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
        success: false,
        status: 500,
      });
    }
  },
};

module.exports = conversationController;
