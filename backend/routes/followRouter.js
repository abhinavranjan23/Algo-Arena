const express = require("express");
const User = require("../models/userSchema");
const userAuth = require("../middleware/userAuth");

const followRouter = express.Router();

// ✅ Follow a user
followRouter.post("/follow/:userId", userAuth, async (req, res) => {
  try {
    const followerId = req.user._id;
    const targetUserId = req.params.userId;

    if (followerId.toString() === targetUserId) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const follower = await User.findById(followerId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (follower.following.includes(targetUserId)) {
      return res
        .status(400)
        .json({ error: "You are already following this user" });
    }
    if (follower.followers.includes(targetUserId)) {
      return res
        .status(400)
        .json({ error: "You are already followed by this user" });
    }

    follower.following.push(targetUserId);
    targetUser.followers.push(followerId);

    await follower.save();
    await targetUser.save();

    res
      .status(200)
      .json({ message: `You are now following ${targetUser.username}` });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

followRouter.post("/unfollow/:userId", userAuth, async (req, res) => {
  try {
    const followerId = req.user._id;
    const targetUserId = req.params.userId;

    if (followerId.toString() === targetUserId) {
      return res.status(400).json({ error: "You cannot unfollow yourself" });
    }

    const follower = await User.findById(followerId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!follower.following.includes(targetUserId)) {
      return res.status(400).json({ error: "You are not following this user" });
    }

    // ✅ Remove from following & followers lists
    follower.following = follower.following.filter(
      (id) => id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== followerId
    );

    await follower.save();
    await targetUser.save();

    res
      .status(200)
      .json({ message: `You have unfollowed ${targetUser.username}` });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

followRouter.get("/suggestions", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const suggestions = await User.suggestUsersToFollow(userId);
    res.status(200).json(suggestions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching suggestions" });
  }
});

followRouter.get("/followers/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "followers",
      "username userimageurl gender usercountry"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.followers); // This will be array of full user objects
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 👣 Get Following list
followRouter.get("/following/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate(
      "following",
      "username userimageurl gender usercountry"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user.following); // Array of user objects
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

followRouter.get("/profile/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password -__v")
      .populate({
        path: "followers",
        select: "_id username userimageurl usercountry",
      })
      .populate({
        path: "following",
        select: "_id username userimageurl usercountry",
      })
      .populate({
        path: "problemSolved.problemId",
        select: "title difficulty",
      });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const solvedProblems = user.problemSolved.map((p) => ({
      _id: p.problemId?._id,
      title: p.problemId?.title,
      difficulty: p.problemId?.difficulty,
      solvedAt: p.solvedAt,
    }));

    res.status(200).json({
      _id: user._id,
      username: user.username,
      userimageurl: user.userimageurl,
      usercountry: user.usercountry,
      gender: user.gender,
      email: user.email,
      followersCount: user.followers.length,
      followingCount: user.following.length,
      followers: user.followers,
      following: user.following,
      problemsSolvedCount: solvedProblems.length,
      solvedProblems,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = followRouter;
