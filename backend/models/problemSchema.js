const mongoose = require("mongoose");

const ProblemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["Easy", "Medium", "Hard"],
    required: true,
  },
  testCases: [
    {
      input: String,
      expectedOutput: String,
    },
  ],

  defaultFunction: {
    type: String,
    default: `function solution(params) {
    // Write your code here...
    return null;
}`,
  },
  marks: { type: Number, required: true },
});

const Problem = mongoose.model("Problem", ProblemSchema);
module.exports = Problem;
