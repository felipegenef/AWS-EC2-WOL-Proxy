const express = require("express");
const app = express();
console.log(process.pid);
app.get("/", async (req, res) => {
  res.json({ message: "AWS EC2 is up after 28 seconds" });
});
app.listen(3000);
