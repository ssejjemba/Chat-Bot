var chatState = {
  messages: [],
  currentRoom: "Lobby",
  users: [],
};

var Chat = function (socket) {
  this.socket = socket;
};

/**
 *
 * @param {string} text
 */
Chat.prototype.sendMessage = function (text) {
  var message = {
    text: text,
    roomId: chatState.currentRoom,
    timestamp: +new Date(),
    avator: User.getUserAvator(),
  };

  this.socket.emit("message", message);
};

/**
 *
 * @param {string} roomId
 */
Chat.prototype.changeRoom = function (roomId) {
  this.socket.emit("join", {
    newRoom: roomId,
  });
};

/**
 *
 * @param {{user_id: { _id: string, avator: string, nick_name: string}, text: string, type: string, timestamp: number}} message
 * @returns {string}
 */
Chat.prototype.renderMessage = function (message) {
  var user_id = User.getUserId();
  if (user_id === message.user_id._id) {
    // render my message
    return this.renderMyMessage(message);
  } else {
    return this.renderOtherUsersMessage(message);
  }
};

/**
 *
 * @param {{user_id: { _id: string, avator: string, nick_name: string}, text: string, type: string, timestamp: number}} message
 * @returns {string}
 */
Chat.prototype.renderMyMessage = function (message) {
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

/**
 *
 * @param {{user_id: { _id: string, avator: string, nick_name: string}, text: string, type: string, timestamp: number}} message
 * @returns {string}
 */
Chat.prototype.renderOtherUsersMessage = function (message) {
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
                ${message.text}
            </div>
        </li>
    `;
};

/**
 *
 * @param {{capacity: number, occupants: number, image: string, name: string}} room
 * @returns {string}
 */
Chat.prototype.renderRoom = function (room) {
  var roomCapacity = room.capacity;
  var roomOccupants = room.occupants;

  var status = roomCapacity === roomOccupants ? "busy" : "available";

  return `
        <li class="clearfix">
            <img
            src=${room.image}
            alt="avatar"
            />
            <div class="about">
            <div class="name">${room.name}</div>
            <div class="status">
                <i class="fa fa-circle ${
                  status === "available" ? "online" : "offline"
                }"></i> ${status}
            </div>
            </div>
        </li>
    `;
};
