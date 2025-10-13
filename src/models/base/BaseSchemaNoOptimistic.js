const mongoose = require("mongoose");

class BaseSchemaNoOptimistic extends mongoose.Schema {
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

module.exports = BaseSchemaNoOptimistic;
