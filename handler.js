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
      res.status(200).json({ message: "AWS EC2 is up and running" });
    } catch (error) {
      res.status(500).json({ message: "AWS EC2 is up and running" });
    }
  });
  app.listen(3000);
}
