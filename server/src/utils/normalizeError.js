const AppError = require("./appError");

/**
 * Normalize Mongo / Auth / App errors
 * Always returns an AppError instance
 */
const normalizeError = (err) => {

  // Already an AppError → return as is

  if (err instanceof AppError) {
    return err;
  }


  // Mongoose Validation Error

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(
      (e) => e.message
    );

    return new AppError(messages.join(", "), 400);
  }


  // Mongo Duplicate Key Error

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const value = err.keyValue?.[field];

    const message = field
      ? `${field} '${value}' already exists`
      : "Duplicate key error";

    return new AppError(message, 409);
  }


  // Mongoose CastError (invalid ObjectId)

  if (err.name === "CastError") {
    return new AppError(
      `Invalid ${err.path}: ${err.value}`,
      400
    );
  }


  // JWT Errors

  if (err.name === "JsonWebTokenError") {
    return new AppError("Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return new AppError("Token expired", 401);
  }


  // Fallback (Unknown / Programming Error)

  console.error("Unhandled error type:", err.name || typeof err, err);
  return new AppError(
    err.message || "Internal server error",
    err.statusCode || 500,
    false // not operational
  );
};

module.exports = normalizeError;
