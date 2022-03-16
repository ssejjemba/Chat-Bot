/**
 * Helper functions for chat room messaging
 */

var lib = {};

var nickNames = {};
var namesUsed = [];
var currentRoom = {};

lib.assignGuestName = function (socket, guestNumber) {
  var name = "Guest" + guestNumber;
  nickNames[socket.id] = name;
  socket.emit("nameResult", {
    success: true,
    name: name,
  });
  namesUsed.push(name);
  return guestNumber + 1;
};

lib.joinRoom = function (socket, room, io) {
  socket.join(room);
  currentRoom[socket.id] = room;
  socket.emit("joinResult", { room: room });
  socket.broadcast.to(room).emit("message", {
    text: nickNames[socket.id] + " has joined " + room + ".",
  });
  var usersInRoom = io.sockets.clients(room);
  if (usersInRoom.length > 1) {
    var usersInRoomSummary = `users currently in ${room}: `;
    for (var index in usersInRoom) {
      var userSocketId = usersInRoom[index].id;
      if (userSocketId !== socket.id) {
        if (index > 0) {
          usersInRoomSummary += `, `;
        }
        usersInRoomSummary += nickNames[userSocketId];
      }
    }
    usersInRoomSummary += ".";
    socket.emit("message", { text: usersInRoomSummary });
  }
};

lib.handleNameChangeAttempts = function (socket, nickNames, namesUsed) {
  socket.io("nameAttempt", function (name) {
    if (name.indexOf("Guest") === 0) {
      // name starts with Guest
      socket.emit("nameResult", {
        success: false,
        message: 'Names cannot begin with "Guest"',
      });
    } else if (namesUsed.indexOf(name) === -1) {
      var previousName = nickNames[socket.id];
      var previousNameIndex = namesUsed.indexOf(previousName);
      namesUsed.push(name);
      nickNames[socket.id] = name;
      delete namesUsed[previousNameIndex];
      socket.emit("nameResult", {
        success: true,
        name: name,
      });
      socket.broadcast.to(currentRoom[socket.id]).emit("message", {
        text: `${previousName} has changed names to ${name}`,
      });
    } else {
      socket.emit("nameResult", {
        success: false,
        message: "That name is already in use",
      });
    }
  });
};

lib.handleMessageBroadcasting = function (socket) {
  socket.on("message", function (message) {
    socket.broadcast.to(message.room).emit("message", {
      data: {
        message: message.text,
        timestamp: message.timestamp,
        user_id: {
          _id: socket.id,
          nick_name: nickNames[socket.id],
          avator: message.avator,
        },
      },
    });
  });
};

lib.handleRoomJoining = function (socket, io) {
  socket.on("join", function (room) {
    socket.leave(currentRoom[socket.id]);
    lib.joinRoom(socket, room.newRoom, io);
  });
};

lib.handleClientDisconnection = function (socket) {
  socket.on("disconnect", function () {
    var nameIndex = namesUsed.indexOf[nickNames[socket.id]];
    delete namesUsed[nameIndex];
    delete nickNames[socket.id];
  });
};

module.exports = lib;
