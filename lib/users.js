/**
 * This file handles users operations
 */
var _data = require("./data");
var helpers = require("./helpers");

var handlers = {};

// Users handler
handlers.users = function (data, callback) {
  var acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

// Container for the users sub-methods
handlers._users = {};

// Users - post
// Required data: firstName, lastName, phone, password, tosAgreement
// Optional data: none
handlers._users.post = function (data, callback) {
  var avator =
    typeof data.payload.avator === "string" && data.payload.avator.length > 0
      ? data.payload.avator.trim()
      : false;
  var firstName =
    typeof data.payload.firstName === "string" &&
    data.payload.firstName.length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName === "string" &&
    data.payload.lastName.length > 0
      ? data.payload.lastName.trim()
      : false;
  var nickName =
    typeof data.payload.nickName === "string" &&
    data.payload.nickName.length > 0
      ? data.payload.nickName.trim()
      : false;
  var phone =
    typeof data.payload.phone === "string" && data.payload.phone.length > 10
      ? data.payload.phone.trim()
      : false;
  var password =
    typeof data.payload.password === "string" &&
    data.payload.password.length > 0
      ? data.payload.password.trim()
      : false;
  var tosAgreement =
    typeof data.payload.tosAgreement === "boolean" &&
    data.payload.tosAgreement === true
      ? true
      : false;

  console.log(data.payload);

  if (
    avator &&
    firstName &&
    lastName &&
    nickName &&
    phone &&
    password &&
    tosAgreement
  ) {
    // Make sure that the user doesn't already exist
    _data.read("users", phone, function (err, data) {
      if (err) {
        // Hash the password
        var hashedPassword = helpers.hash(password);

        if (hashedPassword) {
          // Create the user object
          var userObject = {
            firstName: firstName,
            lastName: lastName,
            nickName: nickName,
            phone: phone,
            hashedPassword: hashedPassword,
            tosAgreement: tosAgreement,
            avator: avator,
          };

          // Store the user
          _data.create("users", phone, userObject, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, { Error: "Could not create a new user" });
            }
          });
        } else {
          callback(500, { Error: "Could not has the user's password" });
        }
      } else {
        callback(400, {
          Error: "A user with that phone number already exists",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// Users - get
// Required data: phone
// Optional data: none
handlers._users.get = function (data, callback) {
  // Check that number provided is valid
  var phone =
    typeof data.queryStringObject.phone === "string" &&
    data.queryStringObject.phone.length > 10
      ? data.queryStringObject.phone.trim()
      : false;
  console.log(data.queryStringObject);
  if (phone) {
    // Get the token from the headers
    var token =
      typeof data.headers.token === "string" ? data.headers.token : false;
    // Verify that the given token is valid for the phone number
    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read("users", phone, function (err, data) {
          if (!err && data) {
            // Remove the hashed password from the user object before returning
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Users - put
// Required data: phone
// Optional data: firstName, lastName, password (at least one must be specified)
// only let authenticated user update their own object and nobody else
handlers._users.put = function (data, callback) {
  // Check that number provided is valid
  var phone =
    typeof data.payload.phone === "string" && data.payload.phone.length > 10
      ? data.payload.phone.trim()
      : false;

  // Check for the optional fields
  var firstName =
    typeof data.payload.firstName === "string" &&
    data.payload.firstName.length > 0
      ? data.payload.firstName.trim()
      : false;
  var lastName =
    typeof data.payload.lastName === "string" &&
    data.payload.lastName.length > 0
      ? data.payload.lastName.trim()
      : false;

  var password =
    typeof data.payload.password === "string" &&
    data.payload.password.length > 0
      ? data.payload.password.trim()
      : false;

  if (phone) {
    // Error if nothing is sent to update
    if (firstName || lastName || password) {
      // Get the token from the headers
      var token =
        typeof data.headers.token === "string" ? data.headers.token : false;

      handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
        if (tokenIsValid) {
          // Lookup user
          _data.read("users", phone, function (err, userData) {
            if (!err && userData) {
              // Update the fields necessary
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.password = helpers.hash(password);
              }

              // Store the new updates
              _data.update("users", phone, userData, function (err) {
                if (!err) {
                  callback(200);
                } else {
                  console.log(err);
                  callback(500, { Error: "Could not update the user" });
                }
              });
            } else {
              callback(400, { Error: "The specified user does not exist" });
            }
          });
        } else {
          callback(403, {
            Error: "Missing required token in header, or token is invalid",
          });
        }
      });
    } else {
      callback(400, { Error: "Missing fields to update" });
    }
  } else {
    callback(400, { Error: "Missing Required fields" });
  }
};

// Users - delete
// Required field : phone
// @TODO only let an authenticated user delete their object. Don't let them delete anyone
// @TODO Cleanup (delete) any other data files associated with this user
handlers._users.delete = function (data, callback) {
  // Check that number provided is valid
  var phone =
    typeof data.queryStringObject.phone === "string" &&
    data.queryStringObject.phone.length > 10
      ? data.queryStringObject.phone.trim()
      : false;
  console.log(data.queryStringObject);
  if (phone) {
    // Get the token from the headers
    var token =
      typeof data.headers.token === "string" ? data.headers.token : false;

    handlers._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        // Lookup the user
        _data.read("users", phone, function (err, data) {
          if (!err && data) {
            _data.delete("users", phone, function (err) {
              if (!err) {
                callback(200);
              } else {
                callback(500, { Error: "Could not delete the specified user" });
              }
            });
          } else {
            callback(400, { Error: "Could not found the specified user" });
          }
        });
      } else {
        callback(403, {
          Error: "Missing required token in header, or token is invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Container for all tokens methods
handlers._tokens = {};

// Tokens - post
// Required data: phone, password
// Optional data: none
handlers._tokens.post = function (data, callback) {
  var phone =
    typeof data.payload.phone === "string" && data.payload.phone.length > 10
      ? data.payload.phone.trim()
      : false;
  var password =
    typeof data.payload.password === "string" &&
    data.payload.password.length > 0
      ? data.payload.password.trim()
      : false;

  if (phone && password) {
    // Lookup the user who matches the phone number
    _data.read("users", phone, function (err, userData) {
      if (!err && userData) {
        // Hash the sent password and compare it to the stored password in the users
        var hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.hashedPassword) {
          // If valid, create a new token with a random name. Set expiration date 1 hour in the future
          var tokenID = helpers.createRandomString(20);

          var expires = Date.now() + 1000 * 60 * 60;
          var tokenObject = {
            phone: phone,
            id: tokenID,
            expires: expires,
          };

          _data.create("tokens", tokenID, tokenObject, function (err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: "Could not create the new token" });
            }
          });
        } else {
          callback(400, { Error: "Password did not match the specified user" });
        }
      } else {
        callback(400, { Error: "Could not find specified user" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// Tokens - get
// Required data: id
// Optional data: none
handlers._tokens.get = function (data, callback) {
  // Check that id provided is valid
  var id =
    typeof data.queryStringObject.id === "string" &&
    data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the token
    _data.read("tokens", id, function (err, data) {
      if (!err && data) {
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Tokens - put
// Required data: id, extend
// Optional data: none
handlers._tokens.put = function (data, callback) {
  // Check that id provided is valid
  var id =
    typeof data.payload.id === "string" && data.payload.id.trim().length === 20
      ? data.payload.id.trim()
      : false;

  var extend =
    typeof data.payload.extend === "boolean" && data.payload.extend === true
      ? true
      : false;

  if (id && extend) {
    // Lookup the token
    _data.read("tokens", id, function (err, data) {
      if (!err && data) {
        if (data.expires > Date.now()) {
          data.expires = Date.now() + 1000 * 60 * 60;
          _data.update("tokens", id, data, function (err) {
            if (!err) {
              callback(200);
            } else {
              callback(500, { Error: "Could not update the token" });
            }
          });
        } else {
          callback(400, {
            Error: "Token has already expired, and cannot be extended",
          });
        }
      } else {
        callback(404, { Error: "Specified token does cot exist" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};

// Tokens - delete
// Required data - id
// Optional data - none
handlers._tokens.delete = function (data, callback) {
  // Check that number provided is valid
  var id =
    typeof data.queryStringObject.id === "string" &&
    data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // Lookup the user
    _data.read("tokens", id, function (err, data) {
      if (!err && data) {
        _data.delete("tokens", id, function (err) {
          if (!err) {
            callback(200);
          } else {
            callback(500, { Error: "Could not delete the specified token" });
          }
        });
      } else {
        callback(400, { Error: "Could not find the specified token" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// Verify if a given token id is currently valid for a given user
handlers._tokens.verifyToken = function (id, phone, callback) {
  // Lookup token
  _data.read("tokens", id, function (err, tokenData) {
    if (!err && tokenData) {
      // Check that the token is for the given user and has not yet expired
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        callback(true);
      } else {
        callback(false);
      }
    } else {
      callback(false);
    }
  });
};
