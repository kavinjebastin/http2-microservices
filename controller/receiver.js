import express from "express";
import fs from "node:fs";
import logger from "../utils/logger.js";
const http2 = await import("node:http2");
import { URL as url } from "./sending-server.js";
const app = express();
const fsPromise = fs.promises;

const client = http2.connect(url, {
  ca: fs.readFileSync("../credentials/localhost-cert.pem"),
});
logger.info("certificate readed successfully");
client.on("error", (err) => {
  logger.error(`Error occurred while trying to get a response ${err.message}`);
});

const req = client.request({
  ":path": "/",
});

req.on("response", (headers, flags) => {
  for (const [key, value] in headers) {
    logger.info(`${key}: ${value}`);
  }
});

req.setEncoding("utf8");
let data = "";
req.on("data", (chunk) => {
  data += chunk;
});
req.on("end", () => {
  const filePath = "../response/response.json";
  fsPromise
    .writeFile(filePath, data, { encoding: "utf-8" })
    .then((_) => {
      logger.info("file write complete");
    })
    .catch((error) => logger.info("file writing failed, errror => ", error));
  client.close();
});
req.end();
