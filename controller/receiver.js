import express from "express";
import fs from "node:fs";
const http2 = await import("node:http2");
const app = express();
const fsPromise = fs.promises;

app
  .get("/", (request, response) => {
    response.type("application/json");
    const client = http2.connect("https://localhost:5500", {
      ca: fs.readFileSync("../credentials/localhost-cert.pem"),
    });
    client.on("error", (err) => err && console.error(err));

    const req = client.request({
      ":path": "/",
    });

    req.on("response", (headers, flags) => {
      for (const name in headers) {
        console.log(`${name}: ${headers[name]}`);
      }
    });

    req.setEncoding("utf8");
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      response.status(200).json(JSON.parse(data));
      const filePath = "../response/response.json";
      fsPromise
        .writeFile(filePath, data, { encoding: "utf-8" })
        .then((_) => {
          console.log("file write complete");
        })
        .catch((error) =>
          console.log("file writing failed, errror => ", error),
        );
      client.close();
    });
    req.end();
  })
  .listen(5000);
