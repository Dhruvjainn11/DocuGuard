const { sendError } = require("../common/response");
const normalizeError = require("../utils/normalizeError");

const errorMiddleware = (err, req, res, next) => {
  const appError = normalizeError(err);

  // Safe logging
  console.error("ERROR 👉",{
    message: appError.message,
    statusCode: appError.statusCode,
    isOperational: appError.isOperational,
    errors: appError.errors,
  });

  return sendError(
    res,
    appError.message,
    appError.statusCode,
    appError.errors
  );
}

module.exports = errorMiddleware;
