const Test = require("../../models/Test");

const testHandler = (socket, socketEventBus) => {
  // Lắng nghe sự kiện 'hello' từ client
  socket.on("test", async (data) => {
    console.log(data); // In ra console server
    console.log("rooms of currentUser", socket.rooms);

    await Test.create({
      name: "Myname",
    });
    const dataResponse = { message: "test success!" };

    // Gửi lại message cho client

    await socketEventBus.publish("test", {
      userId: 1,
      data: dataResponse,
    });
  });
};

module.exports = testHandler;
