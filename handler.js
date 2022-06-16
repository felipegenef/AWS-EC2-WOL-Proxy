const express = require("express");
const cluster = require("cluster");
const numCPUs = require("os").cpus().length;
const app = express();

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker) => cluster.fork());
} else {
  app.get("/", async (req, res) => {
    try {
      console.log("Received request");
      res.status(200).json({ message: "AWS EC2 is up after 28 seconds" });
    } catch (error) {
      console.log("Received request");
      res.status(500).json({ message: "AWS EC2 is up after 28 seconds" });
    }
  });
  app.listen(3000);
}
