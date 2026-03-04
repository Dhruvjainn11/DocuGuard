const rateLimit = require('express-rate-limit');
const { sendError } = require('../common/response');

// 1. General API Limiter (Protects against basic DDoS)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  handler: (req, res) => {
    sendError(res, "Too many requests from this IP, please try again after 15 minutes", 429);
  }
});

// 2. Heavy Route Limiter (Protects your Gemini AI & Cloudinary from abuse)
const documentUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads/analysis per hour
  handler: (req, res) => {
    sendError(res, "Upload limit reached. You can only process 20 documents per hour.", 429);
  }
});

module.exports = { apiLimiter, documentUploadLimiter };