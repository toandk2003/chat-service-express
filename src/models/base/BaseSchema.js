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
        ...options,
      }
    );
  }
}

module.exports = BaseSchema;
