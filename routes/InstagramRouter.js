const express = require("express");
const instagramRouter = express.Router();
instagramRouter.use(express.json());

let data = [];

instagramRouter
  .route("/")

  .get((req, res, nxt) => {
    res.send(req.query["hub.challenge"]);
  })

  .post((req, res, next) => {
    const changes = req.body.entry[0].changes[0];
    const userId = changes.value.from.id;

    let exists = false;
    data.map((info) => {
      if (info.userId === userId) {
        exists = true;
        info.weight++;
        return;
      }
    });

    if (!exists) {
      let userData = {};
      userData.userId = userId;
      userData.weight = 1;
      userData.platform = "instagram";
      data.push(userData);
    }
    console.log(data);
  });

module.exports = instagramRouter;
