const express = require("express");
const Submission = require("../models/submissionSchema");
const User = require("../models/userSchema");
const Problem = require("../models/problemSchema");
const Leaderboard = require("../models/leaderBoard");
const userAuth = require("../middleware/userAuth");
const executeCode = require("../utils/executeCode");
const { client } = require("../redisClient");
const { getIO } = require("../utils/sockets");
const submitRouter = express.Router();

// Advanced score calculation using timeTaken (lower is better)
const calculateScore = (marks, timeTaken, expectedTime = 60000) => {
  const maxScore = marks;
  const minScore = 0.3 * marks;
  const score = maxScore - (timeTaken / expectedTime) * (maxScore - minScore);
  return Math.max(minScore, Math.round(score));
};

submitRouter.post("/submit", userAuth, async (req, res) => {
  try {
    const { problemId, code, language, timeTaken } = req.body;
    const userId = req.user._id;

    if (!problemId || !code || !language || timeTaken == null) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const testCases = problem.testCases;
    if (!testCases || testCases.length === 0)
      return res.status(400).json({ error: "No test cases found." });

    const executionResult = await executeCode(code, language, testCases);

    if (!executionResult.passed) {
      return res.status(200).json({
        message: "Submission failed, try again!",
        passed: false,
        results: executionResult.results,
      });
    }

    // Save/update submission
    let existingSubmission = await Submission.findOne({ userId, problemId });

    if (existingSubmission) {
      existingSubmission.code = code;
      existingSubmission.language = language;
      existingSubmission.results = executionResult.results;
      existingSubmission.timeTaken = timeTaken;
      await existingSubmission.save();
    } else {
      const newSubmission = new Submission({
        userId,
        problemId,
        code,
        language,
        status: "Pass",
        results: executionResult.results,
        timeTaken,
      });
      await newSubmission.save();
    }

    // Update user.progress if not solved before
    const user = await User.findById(userId);
    const alreadySolved = user.problemSolved.some(
      (p) => p.problemId.toString() === problemId
    );

    if (!alreadySolved) {
      user.problemSolved.push({
        problemId,
        difficulty: problem.difficulty,
        tags: problem.tags,
      });
      await user.save();
    }

    // Calculate totalScore using dynamic scoring based on timeTaken
    const allSubmissions = await Submission.find({ userId });
    let totalScore = 0;

    for (let sub of allSubmissions) {
      const p = await Problem.findById(sub.problemId);
      if (!p) continue;
      totalScore += calculateScore(p.marks, sub.timeTaken);
    }

    let leaderboardEntry = await Leaderboard.findOne({ userId });
    if (!leaderboardEntry) {
      leaderboardEntry = new Leaderboard({ userId, score: 0 });
    }
    leaderboardEntry.score = totalScore;
    await leaderboardEntry.save();

    const leaderboard = await Leaderboard.find()
      .sort({ score: -1 })
      .limit(10)
      .populate("userId", "username userimageurl gender usercountry");

    client.set("leaderboard", JSON.stringify(leaderboard));

    // const io = getIO();
    // if (io) {
    //   io.emit(
    //     "leaderboard-update",
    //     leaderboard.map((entry) => ({
    //       userId: entry.userId._id.toString(),
    //       username: entry.userId.username,
    //       score: entry.score,
    //     }))
    //   );
    // }

    res.status(200).json({
      message: "Submission successful!",
      passed: true,
      score: totalScore,
      results: executionResult.results,
      leaderboard,
    });
  } catch (error) {
    console.error("Error in submission:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = submitRouter;
