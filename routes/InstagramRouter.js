const express = require("express");
const instagramRouter = express.Router();
instagramRouter.use(express.json());
const UserSchema = require("../schema/UserSchema");
const axios = require("axios");
require("dotenv").config();

let pendingmediaId = [];
const baseURI = "https://graph.instagram.com";

const getLongLiveToken = async (shortLivedToken) => {
  const res = await axios.get(`${baseURI}/access_token`, {
    params: {
      grant_type: ig_exchange_token,
      client_secret: process.env.client_secret,
      access_token: shortLivedToken,
    },
  });
  return [res.access_token, res.expires_in];
};

const refreshToken = async (longLivedAcessToken) => {
  const res = await axios.get(`${baseURI}/refresh_access_token`, {
    params: { grant_type: ig_refresh_token, access_token: longLivedAcessToken },
  });
  return [res.access_token, res.expires_in];
};

instagramRouter
  .route("/")

  .get((req, res, nxt) => {
    console.log("GET");
    console.log("----------------");
    console.log(req);
    res.send(req.query["hub.challenge"]);
  })

  .post((req, res, next) => {
    console.log("POST");
    console.log("----------------");
    console.log(req);
    res.send(req.query["hub.challenge"]);
  });
instagramRouter.route("/newUserToken").post((req, res, nxt) => {
  const time = new Date().getTime() / 1000;
  const shortLivedToken = req.body.token;
  const userId = req.body.userId;

  const [longLivedAcessToken, expires_in] = getLongLiveToken(shortLivedToken);
  const data = {
    userId: userId,
    token: longLivedAcessToken,
    expires_in: time + expires_in,
  };
  await new UserSchema(data).save();
});

instagramRouter.route("/refresh_token/:userId").post((req, res, next) => {
  try {
    const userData = UserSchema.find({ userId: req.params.userId });
    const currTime = new Date().getTime() / 1000;

    if (userData.expires_in > currTime)
      res.send({
        error: true,
        message: "Token has already expired. Get a new token",
      });

    const [longLivedAcessToken, expires_in] = refreshToken(userData.token);
    userData.token = longLivedAcessToken;
    userData.expires_in = currTime + expires_in;

    await userData.save();
    res.send({ error: false, message: "Token refreshed" });
  } catch (err) {
    res.send({ error: true, message: err });
  }
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
