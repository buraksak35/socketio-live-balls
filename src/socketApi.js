const socketio = require("socket.io");
const io = socketio();

const socketApi = {};
socketApi.io = io;

// Helpers
const randomColor = require("../helpers/randomColorGenerator");

const users = {};

io.on("connection", socket => {
  socket.on("new-user", data => {
    const userData = {
      id: socket.id,
      username: data.username,
      position: {
        x: 0,
        y: 0
      },
      color: randomColor()
    };

    users[socket.id] = userData;

    socket.broadcast.emit("new-user", userData); // send emit other user

    socket.emit("init-players", users); // send emit current user
  });

  socket.on("disconnect", data => {
    socket.broadcast.emit("disconnect-user", users[socket.id]);

    delete users[socket.id];
  });

  socket.on("animate", data => {
    try {
      users[socket.id].position.x = data.x;
      users[socket.id].position.y = data.y;

      socket.broadcast.emit("animate", {
        socketId: socket.id,
        x: data.x,
        y: data.y
      });
    } catch (error) {}
  });

  socket.on("new-message", data => {
    const messageData = Object.assign({ socketId: socket.id }, data);
    socket.broadcast.emit("new-message", messageData);
    console.log(data);
  });
});

module.exports = socketApi;
