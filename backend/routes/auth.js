const express = require("express");
const User = require("../models/userSchema.js");
const emailAuth = require("../middleware/emailAuth.js");
const validateSignup = require("../middleware/signupValid.js");
const generateToken = require("../utils/generateToken.js");
const authRouter = express.Router();
const userAuth = require("../middleware/userAuth.js");
authRouter.post("/signup", emailAuth, validateSignup, async (req, res) => {
  try {
    const {
      username,
      userimageurl,
      role,
      email,
      gender,
      usercountry,
      password,
    } = req.body;
    const user = new User({
      username,
      userimageurl,
      role,
      email,
      gender,
      usercountry,
      password,
    });
    await user.save();
    res.status(201).json({ message: "Registration Successfull" });
  } catch (err) {
    res.status(401).json({ error: "Server Error", message: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ error: "Inavlid Credentials" });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Inavlid Credentials" });
    }
    const token = generateToken(user._id);
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    res.cookie("token", token, { httpOnly: true, secure: true });
    res
      .status(200)
      .json({ message: "Login Successfull", data: userWithoutPassword });
  } catch (err) {
    res.status(401).json({ error: "Server Error", message: err.message });
  }
});

authRouter.get("/logout", async (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout Successfull" });
  } catch (err) {
    res.status(401).json({ error: "Server Error", message: err.message });
  }
});

authRouter.get("/user", userAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ error: "Server Error", message: err.message });
  }
});

module.exports = authRouter;
