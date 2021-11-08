const express = require("express");
const dotenv = require("dotenv");
const port = 80;

const app = express();

app.use(express.json());

app.use("/", (req, res) => {
  res.send(req.query["hub.challenge"]);
  console.log(req.body);
});

app.use("/verify", async (req, res) => {
  console.log(req);
  res.send("1234");
});

app.listen(port, () => {
  console.log("Server listening on port ", port);
});
