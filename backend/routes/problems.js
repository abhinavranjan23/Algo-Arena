const express = require("express");
const Problem = require("../models/problemSchema");
const userAuth = require("../middleware/userAuth");

const problemRouter = express.Router();

problemRouter.get("/problems", async (req, res) => {
  try {
    let { limit = 10, page = 1 } = req.query;

    limit = parseInt(limit);
    page = parseInt(page);

    if (isNaN(limit) || isNaN(page) || limit <= 0 || page <= 0) {
      return res.status(400).json({ error: "Invalid limit or page number" });
    }

    const problems = await Problem.find()
      .select("_id title description difficulty")
      .sort({ difficulty: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalProblems = await Problem.countDocuments();

    res.status(200).json({
      problems,
      totalPages: Math.ceil(totalProblems / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error(" Error fetching problems:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

problemRouter.get("/problem/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findById(id);

    if (!problem) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.status(200).json(problem);
  } catch (error) {
    console.error("❌ Error fetching problem:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
problemRouter.post("/add-problem", userAuth, async (req, res) => {
  try {
    const { role } = req.user;

    if (role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const {
      title,
      description,
      difficulty,
      testCases,
      marks,
      defaultFunction,
    } = req.body;

    if (!title || !description || !difficulty || !marks) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newProblem = new Problem({
      title,
      description,
      difficulty,
      testCases,
      marks,
      defaultFunction:
        defaultFunction ||
        `function solution(params) {\n    // Write your code here...\n    return null;\n}`, // ✅ Ensure default function is set
    });

    await newProblem.save();
    res
      .status(201)
      .json({ message: "Problem added successfully", problem: newProblem });
  } catch (error) {
    console.error("❌ Error adding problem:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = problemRouter;
