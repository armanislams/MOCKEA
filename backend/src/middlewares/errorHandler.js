import ErrorLog from "../model/errorLog.js";

// Error Handling Middleware
// Catches all errors from routes and sends appropriate responses

const errorHandler = async (err, req, res, next) => {
  // Log the error for debugging
  console.error("Error:", err);

  // Default error values
  let status = err.status || 500;
  let message = err.message || "Internal Server Error";

  // Handle specific error types
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation Error: " + err.message;
  }

  if (err.name === "CastError") {
    status = 400;
    message = "Invalid ID format";
  }

  if (err.name === "MongoServerError" && err.code === 11000) {
    status = 409;
    message = "Duplicate field value entered";
  }

  if (err.name === "JsonWebTokenError") {
    status = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    status = 401;
    message = "Token expired";
  }

  // Firebase specific errors
  if (err.code?.startsWith("auth/")) {
    status = 401;
    message = "Authentication error: " + err.message;
  }

  // Save error to database
  try {
    await ErrorLog.create({
      message: message,
      stack: err.stack,
      method: req.method,
      path: req.originalUrl,
      status: status,
      userEmail: req.decoded_email || null,
    });
  } catch (logErr) {
    console.error("Failed to save error log:", logErr);
  }

  // Send error response
  res.status(status).json({
    success: false,
    status: status,
    message: message,
    ...(process.env.NODE_ENV === "development" && { error: err }),
  });
};

export default errorHandler;
