// client.js
const { io } = require("socket.io-client");

const client1 = io("http://localhost:8888", { query: { userId: 1 } });
const client2 = io("http://localhost:8888", { query: { userId: 2 } });

client1.on("connect", () => {
  console.log("Client 1 connected:", client1.id);
});

client2.on("connect", () => {
  console.log("Client 2 connected:", client2.id);
});

client1.on("test", (data) => {
  console.log("Client 1 received:", data);
});

client2.on("test", (data) => {
  console.log("Client 2 received:", data);
});
