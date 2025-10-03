const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const userService = require('../services/userService');

exports.createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(ApiResponse.success('User created', user, 201));
  } catch (err) {
    next(new ApiError(err.message, 400));  
  }
};
