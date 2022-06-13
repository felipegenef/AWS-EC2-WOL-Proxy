const express = require("express");
const app = express();
app.get("/", async (req, res) => {
  await new Promise((resolve) => setTimeout(resolve, 28000));

  res.json({ message: "AWS EC2 is up after 28 seconds" });
});
app.listen(3000);
