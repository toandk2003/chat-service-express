const joinRoom = (socket, room) => {
  if (!socket.rooms.has(room)) {
    socket.join(room);
    console.log(`Socket join room successfully: ${room}`);
  } else {
    console.log("Socket đã ở trong room:", room);
  }
};

module.exports = joinRoom;
