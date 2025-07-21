const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    userimageurl: {
      type: String,
      default: "https://example.com/default-profile-pic.png",
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    email: { type: String, required: true, unique: true },
    gender: { type: String, required: true, enum: ["Male", "Female", "Other"] },
    usercountry: { type: String, required: true },
    password: { type: String, required: true, select: false },

    // ✅ Following system
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users they follow
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users who follow them

    problemSolved: [
      {
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: "Problem" },
        difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
        tags: [{ type: String }],
        solvedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// ✅ Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// ✅ Suggest users to follow using BFS (depth-based) + problem-solving similarity
UserSchema.statics.suggestUsersToFollow = async function (userId) {
  const user = await this.findById(userId).populate("following");
  if (!user) return [];

  let queue = [...user.following]; // Start BFS from people user follows
  let visited = new Set(queue.map((u) => u._id.toString())); // Track visited users
  let suggestions = new Map(); // Store user recommendations and scores
  let depth = 2; // Limit BFS depth to 2 (friends-of-friends)

  // Step 1️: BFS for Friend-of-Friends Search
  while (queue.length && depth > 0) {
    let size = queue.length;
    for (let i = 0; i < size; i++) {
      const current = queue.shift();
      const userDetails = await this.findById(current._id).populate(
        "following"
      );

      for (let f of userDetails.following) {
        const userToSuggestId = f._id.toString();
        if (!visited.has(userToSuggestId) && userToSuggestId !== userId) {
          visited.add(userToSuggestId);
          queue.push(f);
          suggestions.set(
            userToSuggestId,
            (suggestions.get(userToSuggestId) || 0) + 1
          ); // +1 for mutual following
        }
      }
    }
    depth--;
  }

  // Step 2️: Collaborative Filtering (Find Similar Users by Problem-Solving)
  const userProblems = user.problemSolved.map((p) => p.problemId.toString());
  const similarUsers = await this.find({
    _id: { $ne: userId }, // Exclude self
    "problemSolved.problemId": { $in: userProblems }, // Match users solving similar problems
  });

  for (const similarUser of similarUsers) {
    const commonProblems = similarUser.problemSolved.filter((p) =>
      userProblems.includes(p.problemId.toString())
    );
    const userToSuggestId = similarUser._id.toString();

    if (!visited.has(userToSuggestId)) {
      suggestions.set(
        userToSuggestId,
        (suggestions.get(userToSuggestId) || 0) + commonProblems.length * 2
      ); // Weight for similar problems solved
    }
  }

  // Step 3️: Sort & Return Top 5 Users to Follow
  const sortedSuggestions = Array.from(suggestions.entries())
    .sort((a, b) => b[1] - a[1]) // Sort by highest score
    .map(([id]) => id);

  return this.find({ _id: { $in: sortedSuggestions.slice(0, 5) } });
};

//  Index for efficient searching
UserSchema.index({ username: "text", email: "text" });

const User = mongoose.model("User", UserSchema);
module.exports = User;
