const { User } = require("../models/User");
const UserConversation = require("../models/UserConversation");
const countTotal = require("../common/utils/countTotal");
const queryDocument = require("../common/utils/queryDocument");
const createPaginateResponse = require("../common/utils/createPaginateResponse");
const Conversation = require("../models/Conversation");
const { Message, STATUS, REACTION } = require("../models/Message");

const conversationController = {
  getList: async (req, res) => {
    try {
      const { name, pageSize, currentPage, avoidConversationIds } = req.query;
      const email = req.currentUser.email;
      console.log("email: " + email);
      console.log("req: ", req.query);

      const user = await User.findOne({ email, status: "ACTIVE" });

      const conv = await Conversation.findOne();

      const fakeUser0 = await User.findOne({
        email: "fakeUser0@gmail.com",
        status: "ACTIVE",
      });

      const fakeUser16 = await User.findOne({
        email: "fakeUser16@gmail.com",
        status: "ACTIVE",
      });

      await Message.insertMany([
        {
          conversationId: conv._id,
          senderId: fakeUser0._id,
          recipients: [
            {
              userId: fakeUser16._id,
              status: STATUS.DELIVERED,
              deliveredAt: new Date(),
              readAt: new Date(),
              reaction: REACTION.ANGRY,
              reactedAt: new Date(),
            },
          ],
          reaction: REACTION.LIKE,
          reactedAt: new Date(),
          content: "content",
          type: "text",
        },
      ]);

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
            from: "conversation_views",
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
            as: "conversationViews",
          },
        },

        ...(name
          ? [
              {
                $match: {
                  conversationViews: { $ne: [] }, // Chỉ giữ lại những document mà mảng conversationNames không rỗng
                },
              },
            ]
          : []),

        {
          $addFields: {
            lastMessageDate: {
              $cond: {
                if: { $gt: [{ $size: "$lastMessage" }, 0] }, // Kiểm tra nếu có tin nhắn
                then: { $arrayElemAt: ["$lastMessage.createdAt", 0] }, // Lấy createdAt của tin nhắn đầu tiên trong mảng
                else: "$conversation.createdAt", // Nếu không có tin nhắn, dùng thời gian tạo conversation
              },
            },
          },
        },

        {
          $sort: { lastMessageDate: -1 },
        },
      ];

      // Thực hiện đếm tổng số bản ghi
      const total = await countTotal(UserConversation, pipeline);

      // Thêm skip và limit vào pipeline đuser_conversationsể phân trang
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
