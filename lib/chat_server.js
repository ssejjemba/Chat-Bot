/**
 * Library for chat server functions
 */
var mime = require("mime");
var path = require("path");
var data = require("./data");

var chatServer = {};

chatServer.send404 = function (response) {
  response.writeHead(404, { "Content-Type": "text/plain" });
  response.write("Error 404: resource not found.");
  response.end();
};

chatServer.sendFile = function (response, filePath, fileContents) {
  response.writeHead(200, {
    "Content-Type": mime.lookup(path.basename(filePath)),
  });
  response.end(fileContents);
};

chatServer.serveStatic = function (response, cache, filePath) {
  if (cache[filePath]) {
    // use cache to send file
    chatServer.sendFile(response, filePath, cache[filePath]);
  } else {
    // read and add file to cache
    data.pubRead("", filePath, function (error, _data) {
      if (error) {
        chatServer.send404(response);
      } else {
        // cache and send file
        cache[filePath] = _data;
        chatServer.sendFile(response, filePath, _data);
      }
    });
  }
};

module.exports = chatServer;
