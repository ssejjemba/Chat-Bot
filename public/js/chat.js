var chatState = {
  messages: [],
  currentRoom: "Lobby",
  users: [],
};

var Chat = function (socket) {
  this.socket = socket;
};

Chat.prototype.sendMessage = function (room, text) {
  var message = {
    text: text,
    room: room,
    timestamp: +new Date(),
    avator: User.getUserAvator(),
  };

  this.socket.emit("message", message);
};

Chat.prototype.changeRoom = function (room) {
  this.socket.emit("join", {
    newRoom: room,
  });
};

Chat.prototype.makeMyMessage = function (message) {
  var status = User.getUserStatus();
  return `
        <li class="clearfix">
            <div class="message-data message-data-right text-right">
                <img
                src=${User.getUserAvator()}
                alt="avatar"
                />
                <div class="person-about">
                <span class="message-data-time">${User.getUserNickName()}, ${moment(
    message.timestamp
  ).calendar()}</span>
                <span><i class="fa fa-circle ${
                  status === "online" ? status : "offline"
                }"></i> ${status}</span>
                </div>
            </div>
            <div class="message other-message float-right">
                ${message.text}
            </div>
        </li>
    `;
};

Chat.prototype.makeOtherUsersMessage = function (message) {
  var status;
  var userId = message.user_id._id;
  var user = chatState.users.find((user) => user._id === userId);
  if (user) {
    status = "online";
  } else {
    //   TODO: get user status from backend
    status = "offline";
  }
  return `
        <li class="clearfix">
            <div class="message-data">
                <img
                src=${message.user_id.avator}
                alt="avatar"
                />
                <div class="person-about">
                <span class="message-data-time">${
                  message.user_id.nick_name
                }, ${moment(message.timestamp).calendar()}</span>
                <span
                    ><i class="fa fa-circle ${
                      status === "online" ? status : "offline"
                    }"></i> ${status}</span
                >
                </div>
            </div>
            <div class="message my-message">
                Project has already been finished and I have results to
                show you when I get back.
            </div>
        </li>
    `;
};
