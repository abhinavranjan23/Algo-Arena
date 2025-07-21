const mongoose = require("mongoose");

const LeaderboardSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    score: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const LeaderBoard = mongoose.model("Leaderboard", LeaderboardSchema);
module.exports = LeaderBoard;
