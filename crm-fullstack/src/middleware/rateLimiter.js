const rateLimit = require("express-rate-limit");

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per IP
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    data: null,
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { adminLimiter };
