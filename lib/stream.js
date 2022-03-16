var fs = require("fs");
var path = require("path");

var stream = {};

stream.demo = function () {
  // Demonstrate how I'd generally use node events on streams
  stream.sampleStream = fs.createReadStream(
    path.resolve("./data/resource.json")
  );

  stream.sampleStream.on("data", function (chunk) {
    console.log(chunk);
  });

  stream.sampleStream.on("end", function () {
    console.log("finished");
  });
};

module.exports = stream;
