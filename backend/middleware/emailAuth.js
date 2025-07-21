const User = require("../models/userSchema.js");
const validator = require("validator");
const emailAuth = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const isEmailAlreadyUsed = await User.findOne({ email: email });
    if (isEmailAlreadyUsed) {
      return res.status(400).json({ error: "Email already in use" });
    }
    next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};
module.exports = emailAuth;
