const Test = require("../models/Test");

const testHandler = (socket) => {
      // Lắng nghe sự kiện 'hello' từ client
    socket.on('test', async (data) => {
        console.log(data); // In ra console server
        Test.create({
            name:"Myname"
        })
        const dataResponse = await Test.find();
        console.log(dataResponse);
        // Gửi lại message cho client
        socket.emit('test_response', { message: 'Hello from server!', data: dataResponse });
    });
    
};

module.exports = testHandler;