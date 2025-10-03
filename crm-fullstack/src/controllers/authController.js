const authService = require('../services/authService');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    let profilePicture = null;

    if (req.file) {
      // Only store relative path for frontend
      profilePicture = `uploads/${req.file.filename}`;
    }

    const user = await authService.registerUser({ email, password, name, profilePicture });

    res.status(201).json(ApiResponse.success('User registered successfully', user, 201));
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser({ email, password });
    res.json(ApiResponse.success('Login successful', data));
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await authService.logoutUser(refreshToken);
    res.json(ApiResponse.success('Logged out successfully'));
  } catch (err) {
    next(new ApiError(err.message, 400));
  }
};

// authController.js
exports.refreshToken = async (req, res, next) => {
  try {
    console.log("refresh token execute", req.body);

    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "No refresh token" });

    // Decode the refresh token (contains user info in payload)
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

     
    // const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    // if (!user) return res.status(404).json({ message: "User not found" });

    // Generate new access token using data from refresh token
    const accessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role }, // data from decoded refresh token
      process.env.JWT_SECRET,
      { expiresIn: "15m" } 
    );

    res.json({ accessToken });  
  } catch (err) {
    console.error(err);
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};