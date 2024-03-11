import fs from "node:fs";
import engineJSON from "../data/engineJson.js";
const http2 = await import("node:http2");
const server = http2.createSecureServer({
  key: fs.readFileSync("../credentials/localhost-privkey.pem"),
  cert: fs.readFileSync("../credentials/localhost-cert.pem"),
});
const encoding = "utf-8";
server.on("error", console.error);

server.on("stream", (stream, headers) => {
  // stream is a Duplex
  stream.respond({
    "content-type": "application/json; charset=utf-8",
    status: 200,
  });

  stream.write("[", encoding);
  engineJSON.forEach((itinerary, index, array) => {
    stream.write(
      JSON.stringify(itinerary),
      encoding,
      (error) => error && console.error(error),
    );
    if (index !== array.length - 1) stream.write(",", encoding);
  });

  stream.end("]");
});

server.listen(5500);
console.log("server is ready to send hello world");