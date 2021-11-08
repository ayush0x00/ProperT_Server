const express = require("express");
const dotenv = require("dotenv");
const instagramRouter = require("./routes/InstagramRouter");
const port = 80;

let data = [];

const app = express();

app.use(express.json());

app.use("/instagram", instagramRouter);

app.use("/twitter", twitterRouter);

app.get("/verify", (req, res) => {
  console.log(req);
  res.send("Hello world");
});

app.listen(port, () => {
  console.log("Server listening on port ", port);
});
