const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/userSchema.js");
dotenv.config();

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    if (!decode) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(decode.userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid " });
  }
};
module.exports = userAuth;
