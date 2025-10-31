const joinRoom = (socket, room) => {
  try {
    socket.join(room);
    console.log(`Socket join room successfully: ${room}`);
  } catch (e) {
    console.log(e);
  }
};

module.exports = joinRoom;
