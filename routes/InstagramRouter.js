const express = require("express");
const instagramRouter = express.Router();
instagramRouter.use(express.json());
const UserSchema = require("../schema/UserSchema");
const axios = require("axios");

let pendingmediaId = [];
const baseURI = "https://graph.facebook.com";

instagramRouter
  .route("/")

  .get((req, res, nxt) => {
    // res.send(req.query["hub.challenge"]);
    console.log("GET");
    console.log("----------------");
    console.log(req);
  })

  .post((req, res, next) => {
    console.log("POST");
    console.log("----------------");
    console.log(req);
    // const changes = req.body.entry[0].changes[0];
    // const userId = changes.value.from.id;

    // let exists = false;
    // data.map((info) => {
    //   if (info.userId === userId) {
    //     exists = true;
    //     info.weight++;
    //     return;
    //   }
    // });

    // if (!exists) {
    //   let userData = {};
    //   userData.userId = userId;
    //   userData.weight = 1;
    //   userData.platform = "instagram";
    //   data.push(userData);
    // }
    // console.log(data);
  });
instagramRouter.route("/newUser").post((req, res, nxt) => {
  const shortLivedToken = req.body.token;
  const userId = req.body.userId;

  const longLivedAcessToken = getLongLiveToken(shortLivedToken);
  const data = {
    userId: userId,
    token: longLivedAcessToken,
  };
  await new UserSchema(data).save();
});

instagramRouter.route("/check/:userId").get(async (req, res, nxt) => {
  const userData = UserSchema.find({ userId: req.params.userId });
  try {
    const data = await axios.get(
      `${baseURI}/${req.params.userId}/media?access_token=${userData.token}`
    );

    let mediaWatch = data.data[0].filter((id, idx) => {
      if (pendingmediaId.includes(id)) {
        pendingmediaId.splice(idx, 1);
        return true;
      } else return false;
    });

    userData.mediaWatch = mediaWatch;
    await userData.save();
    res.send({ error: false, message: "Successfully added to media watch" });
  } catch (err) {
    res.send({ error: true, message: err });
  }
});

instagramRouter.route("/populate/:userId").get(async (req, res, nxt) => {
  try {
    const data = UserSchema.find({ userId: req.params.userId });
    let mediaDetails = [];

    data.mediaDetails.forEach((media) => {
      let info = {};
      const insight = await axios.get(`${baseURI}/${media}/insights`, {
        params: { access_token: data.token, metric: { impressions, reach } },
      });

      insight.data.forEach((ele) => {
        if (ele.name === "impressions") info.impressions = ele.values[0].value;
        else info.reach = ele.values[0].value;
      });

      const likeinfo = await axios.get(`${baseURI}/${media}`, {
        params: {
          access_token: data.token,
          fields: { comments_count, like_count },
        },
      });

      info.comments_count = likeinfo.comments_count;
      info.like_count = likeinfo.like_count;

      mediaDetails.push(info);
    });

    data.mediaDetails = mediaDetails;
    await data.save();
    res.send({ error: false, message: "Updated media details" });
  } catch (err) {
    res.send({ error: true, message: err });
  }
});

module.exports = instagramRouter;
