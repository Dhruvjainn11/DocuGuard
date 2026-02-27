const AppError = require("../utils/appError");
const joiMessageMap = require("../utils/joiMessageMap");
const fs = require("fs");

const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const isMultipart = req.is("multipart/form-data");

    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: !isMultipart,
      allowUnknown: isMultipart,
    });

    if (error) {
      const errors = {};
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error("Failed to cleanup uploaded file:", err);
          }
        });
      }

      error.details.forEach((detail) => {
        const field = detail.path.length > 0 ? detail.path.join(".") : "_error";
        errors[field] = joiMessageMap(detail);
      });
      return next(new AppError("Validation failed", 400, errors));
    }

    req[property] = value;
    next();
  };
};



module.exports = {  validate };
