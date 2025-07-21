const mongoose = require("mongoose");

const SubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
    required: true,
  },
  code: { type: String, required: true },
  language: {
    type: String,
    enum: ["python", "javascript", "java", "c", "cpp"],
    required: true,
  },
  timeTaken: { type: Number, required: true }, // in milliseconds
  status: { type: String, enum: ["Pass", "Fail"], required: true },
  results: { type: Array, required: true }, // Stores input, expected, actual output
  submittedAt: { type: Date, default: Date.now },
});

const Submission = mongoose.model("Submission", SubmissionSchema);
module.exports = Submission;
