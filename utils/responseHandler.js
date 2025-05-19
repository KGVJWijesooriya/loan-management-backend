/**
 * Standardized success response
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {Object} data - Data to be returned
 * @param {Number} statusCode - HTTP status code
 * @returns {Object} - Formatted response
 */
exports.success = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
  };

  if (data) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standardized error response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code
 * @returns {Object} - Formatted response
 */
exports.error = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};
