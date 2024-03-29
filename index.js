const express = require("express");
const mongoose = require("mongoose");
const cluster = require("cluster");
const os = require("os");
require("dotenv").config();
const middlewares = require("./middlewares");

if (cluster.isMaster) {
  const cpuCount = os.cpus().length;
  for (let i = 0; i < cpuCount; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, process) => {
    console.log("Worker died with pid", worker.process.pid);
    cluster.fork();
  });
} else {
  mongoose
    .connect(process.env.DB_URL)
    .then(() => {
      app.listen(process.env.PORT || 3000, () => {
        console.log(
          "DB & server connected, Port:",
          process.env.PORT,
          "Worker PID:",
          cluster.worker.process.pid
        );
      });
    })
    .catch((err) => {
      console.log(err);
    });
  const app = express();
  app.use((req, res, next) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", ["PUT", "POST", "GET", "DELETE"]);
    res.set("Access-Control-Allow-Headers", ["Content-Type", "Authorization"]);
    next();
  });
  middlewares(app);
}
