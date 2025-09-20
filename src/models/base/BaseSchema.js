const mongoose = require('mongoose');
const snowflakeGenerator = require('../../common/utils/snowflake');

class BaseSchema extends mongoose.Schema {
  constructor(definition, options) {
    super(
      {
        _id: {
          type: String,
          default: () => snowflakeGenerator.generate()
        },
         deletedAt: {
          type: Date,
          default: null, // mặc định chưa xóa
        },
        ...definition
      },
      {
        timestamps: true, // Tự động thêm createdAt/updatedAt
        ...options
      }
    );
  }
}

module.exports = BaseSchema;
