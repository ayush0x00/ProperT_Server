const express = require("express");
const twitterRouter = express.Router();
twitterRouter.use(express.json());

let data = [];

twitterRouter.route("/").post((req, res, nxt) => {});
