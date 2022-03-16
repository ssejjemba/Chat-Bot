var socketio = require("socket.io");
var chatLogic = require("./chat_logic");

var io;
var guestNumber = 1;

exports.listen = function (server) {
  io = socketio.listen(server);

  io.set("log level", 1);

  io.sockets.on("connection", function (socket) {
    //   Join as guest
    guestNumber = chatLogic.assignGuestName(socket, guestNumber);
    chatLogic.joinRoom(socket, "Lobby", io);

    //   Listen to emitted events
    chatLogic.handleMessageBroadcasting(socket);
    chatLogic.handleNameChangeAttempts(socket);
    chatLogic.handleRoomJoining(socket);

    socket.on("rooms", function () {
      socket.emit("rooms", io.sockets.manager.rooms);
    });

    // Listen for disconnections
    chatLogic.handleClientDisconnection(socket);
  });
};
