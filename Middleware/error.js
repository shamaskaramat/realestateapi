const ErrorHanlder = require("../utils/ErrorHandler");



const error = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
  
    // Handle CastError (invalid MongoDB ID)
    if (err.name === "CastError") {
      const message = `Resource not found. Invalid ${err.path}`;
      err = new ErrorHanlder(message, 400, err.message);
    }
  
    // Handle duplicate key error (e.g., unique index violation)
    if (err.code === 11000) {
      const message = "Duplicate key error. Please check your input.";
      err = new ErrorHanlder(message, 400, err.message);
    }
  
    // Handle invalid JSON web token error
    if (err.name === "JsonWebTokenError") {
      const message = "Invalid JSON web token. Please try again.";
      err = new ErrorHanlder(message, 400, err.message);
    }
  
    // Handle expired JSON web token error
    if (err.name === "JsonWebTokenExpired") {
      const message = "Your token has expired. Please log in again.";
      err = new ErrorHanlder(message, 401, err.message);
    }
  
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  };
  
  module.exports = error;