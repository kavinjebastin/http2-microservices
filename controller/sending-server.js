import fs from "node:fs";
import engineJSON from "../data/engineJson.js";
import logger from "../utils/logger.js";
const http2 = await import("node:http2");
const server = http2.createSecureServer({
  key: fs.readFileSync("../credentials/localhost-privkey.pem"),
  cert: fs.readFileSync("../credentials/localhost-cert.pem"),
});
const encoding = "utf-8";
server.on("error", (error) => {
  logger.error(`ERROR occurred while streaming, -> ${error?.message}`)
});
const PORT = process.env.PORT ?? 5500;
export const URL = `https://localhost:${PORT}/`;
server.on("stream", (stream, headers) => {
  logger.info(`GET request sent at ${URL}`);
  // stream is a Duplex
  stream.respond({
    "content-type": "application/json; charset=utf-8",
    status: 200,
  });
    stream.write("[", encoding);
    engineJSON.forEach((itinerary, index, array) => {
      const stringItinerary =
        index !== array.length - 1
          ? `${JSON.stringify(itinerary)},`
          : JSON.stringify(itinerary);
      stream.write(
        stringItinerary,
        encoding,
        (error) => error && console.error(error)
      );
    });
    stream.end("]");
});
server.listen(PORT, () => {
  logger.info("server is ready to send Array of itineraries");
  logger.info(`Http2 server is listening on ${URL}`);
});
