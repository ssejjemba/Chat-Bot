var http = require("http");
var chat = require("./chat_server");

var server = {};

var cache = {};

server.init = function () {
  server.httpServer = http.createServer();
  server.httpServer.on("request", function (req, res) {
    var filePath = null;
    if (req.url === "/") {
      filePath = "/index.html";
    } else {
      filePath = req.url;
    }
    chat.serveStatic(res, cache, filePath);
  });
  server.httpServer.listen(3000);
  console.log("Server is running at port:3000");
};

module.exports = server;
