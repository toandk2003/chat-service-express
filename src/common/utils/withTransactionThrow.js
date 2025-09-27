const mongoose = require("mongoose");

const withTransactionThrow = async (handler, ...args) => {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await handler(session, ...args);
    });
    return result;
  } catch (e) {
    console.error("❌ Transaction error:", e);
    throw e;
  } finally {
    session.endSession();
  }
};

module.exports = withTransactionThrow;
