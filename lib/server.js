var http = require("http");

var server = {};

server.init = function () {
  server.httpServer = http.createServer();
  server.httpServer.on("request", function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Hello World \n");
  });
  server.httpServer.listen(3000);
  console.log("Server is running at port:3000");
};

module.exports = server;
