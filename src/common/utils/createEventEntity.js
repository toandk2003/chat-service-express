const createEventEntity = (payload, destination = process.env.SYNC_STREAM) => {
  if (!payload || !payload.eventType) {
    throw new Error("❌ Invalid payload: eventType is required");
  }

  if (!destination) {
    throw new Error("❌ Destination stream is not defined");
  }
  return {
    payload: JSON.stringify(payload),
    destination: destination,
  };
};

module.exports = createEventEntity;
