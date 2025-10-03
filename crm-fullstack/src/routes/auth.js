const express = require('express');
const authController = require('../controllers/authController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');

const { registerValidationRules, validate } = require("../middleware/validators"); // ✅ import

const router = express.Router();



const passport = require('passport');
require('../config/passport'); // Load Google strategy

 
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

 
 
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  async (req, res, next) => {
    try {
      const user = req.user;
      const data = await authService.loginUser({ 
        email: user.email, 
        password: null,
        isOAuth: true
      });

      // Redirect to frontend with tokens in query params
      const redirectUrl = `http://localhost:5173/oauth-success?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}&user=${encodeURIComponent(JSON.stringify(data.user))}`;
      res.redirect(redirectUrl);
    } catch (err) {
      next(new ApiError(err.message, 400));
    }
  }
);

 
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});
const upload = multer({ storage });

 
router.post(
  '/register',
  upload.single('profilePicture'),
  registerValidationRules,
  validate,
  authController.register
);

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);



module.exports = router;
