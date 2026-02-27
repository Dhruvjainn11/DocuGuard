class AppError extends Error {
  constructor(message, statusCode = 500, errors = null, isOperational = true) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.errors = errors;     
    this.isOperational = isOperational; // good practice

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
