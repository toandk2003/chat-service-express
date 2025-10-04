const mongoose = require("mongoose");

class BaseSchema extends mongoose.Schema {
  constructor(definition, options) {
    super(
      {
        deletedAt: {
          type: Date,
          default: null, // mặc định chưa xóa
        },
        ...definition,
      },
      {
        timestamps: true, // Tự động thêm createdAt/updatedAt
        optimisticConcurrency: true, // ⚡ bật OCC cho toàn bộ schema kế thừa
        ...options,
      }
    );
  }
}

module.exports = BaseSchema;
