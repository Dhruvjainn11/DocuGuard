const multer = require('multer');
const { sendError } = require('../common/response');
const AppError = require('../utils/appError');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError("Invalid file type. Only JPEG, PNG and PDF are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

const uploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('document'); // We expect the key to be 'document'

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer-specific error (like file too large)
      return sendError(res, `Multer Error: ${err.message}`, 400);
    } else if (err) {
      // A custom error from our fileFilter
      return sendError(res, err.message, 400);
    }
    next();
  });
};

module.exports = { uploadMiddleware };