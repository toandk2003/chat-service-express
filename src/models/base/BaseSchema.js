const mongoose = require('mongoose');
const snowflakeGenerator = require('../../utils/snowflake');

class BaseSchema extends mongoose.Schema {
  constructor(definition, options) {
    super(
      {
        _id: {
          type: String,
          default: () => snowflakeGenerator.generate()
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
