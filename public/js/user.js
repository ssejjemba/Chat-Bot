var userStorageKeys = {
  userId: "chat_local_storage_guest",
  status: "chat_local_storage_status",
  avator: "chat_local_storage_avator",
  nick_name: "chat_local_storage_nickname",
};

var User = function (socket) {
  this.socket = socket;
};

User.prototype.getUserId = function () {
  return localStorage.getItem(userStorageKeys.userId);
};

User.prototype.setUserId = function (userId) {
  try {
    localStorage.setItem(userStorageKeys.userId, userId);
  } catch {
    console.error("Failed to set User Id");
  }
};

User.prototype.getUserStatus = function () {
  return sessionStorage.getItem(userStorageKeys.status);
};

User.prototype.setUserStatus = function (status) {
  try {
    sessionStorage.setItem(userStorageKeys.status, status);
  } catch {
    console.error("Failed to set User Status");
  }
};

User.prototype.getUserAvator = function () {
  return localStorage.getItem(userStorageKeys.avator);
};

User.prototype.setUserAvator = function (avator) {
  try {
    localStorage.setItem(userStorageKeys.avator, avator);
  } catch {
    console.error("Failed to set User avator");
  }
};

User.prototype.getNickName = function () {
  return localStorage.getItem(userStorageKeys.nick_name);
};

User.prototype.setNickName = function (name) {
  try {
    localStorage.setItem(userStorageKeys.nick_name, name);
  } catch {
    console.error("Failed to set user nick name");
  }
};
