const express = require("express");
const Leaderboard = require("../models/leaderBoard");
const { client, redisReady } = require("../redisClient");

const leaderRouter = express.Router();

leaderRouter.get("/leaderboard", async (req, res) => {
  try {
    await redisReady; // ensure Redis is connected
    const cachedData = await client.get("leaderboard");

    if (cachedData) {
      console.log("🔹 Served from Redis cache");
      console.log("Cached Data:", cachedData);
      return res.json(JSON.parse(cachedData));
    }

    const leaderboard = await Leaderboard.find()
      .sort({ score: -1 })
      .limit(10)
      .populate("userId", "username userimageurl  gender usercountry")
      .lean();

    await client.set("leaderboard", JSON.stringify(leaderboard), {
      EX: 300,
    });

    res.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
module.exports = leaderRouter;
