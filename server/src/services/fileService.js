const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a buffer to Cloudinary using a stream
 * @param {Buffer} buffer - The file buffer from Multer
 * @param {String} folder - Target folder in Cloudinary
 */
const uploadToCloudinary = (buffer, folder = 'DocuGaurd') => { 
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder,
        resource_type: "auto", // Automatically detects if it's image or PDF
        type: "private" // Production-ready: Files are not public by default
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );

    // Convert our Buffer into a Stream and pipe it to Cloudinary
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = { uploadToCloudinary };