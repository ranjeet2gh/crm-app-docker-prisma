const { body, validationResult } = require("express-validator");
const path = require("path");
const ApiResponse = require("../utils/apiResponse");
const STATUS = require("../config/httpStatus");

// Rules for user registration
const registerValidationRules = [
  body("email")
    .isEmail()
    .withMessage("Invalid email format"),
  body("name")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters long"),
  body("profilePicture").custom((value, { req }) => {
    if (!req.file) return true; // optional

    const fileSize = req.file.size;
    const maxSize = 1 * 1024 * 1024; // 5MB
    if (fileSize > maxSize) throw new Error("Profile picture must not exceed 1MB");

    const allowedExt = [".jpg", ".jpeg", ".png"];
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (!allowedExt.includes(ext)) throw new Error("Only .jpg, .jpeg, .png files are allowed");

    return true;
  }),
];

// Middleware to send back validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(STATUS.BAD_REQUEST)
      .json(ApiResponse.error(
        errors.array().map(e => e.msg).join(", "),
        STATUS.BAD_REQUEST
      ));
  }
  next();
};

module.exports = { registerValidationRules, validate };
