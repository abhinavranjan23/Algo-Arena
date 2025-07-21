const validator = require("validator");
const validateSignup = (req, res, next) => {
  const { username, userimageurl, role, email, gender, usercountry, password } =
    req.body;
  const errors = [];
  if (!username || username.length < 3) {
    errors.push("Username must be at least 3 characters long.");
  }
  // if (!userimageurl || !validator.isURL(userimageurl)) {
  //   errors.push("Invalid user image URL.");
  // }
  if (!usercountry || usercountry.length < 3) {
    errors.push("User country must be at least 3 characters long.");
  }
  if (!gender || !["Male", "Female", "Others"].includes(gender)) {
    errors.push("Gender Must be Male, Female or Others");
  }
  if (!password || !validator.isStrongPassword(password)) {
    errors.push(
      "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
};
module.exports = validateSignup;
