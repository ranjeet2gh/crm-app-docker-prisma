const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.message);

  const status = err.statusCode || 500;
  res.status(status).json(
    ApiResponse.error(err.message || 'Internal Server Error', status)
  );
};

module.exports = errorHandler;
