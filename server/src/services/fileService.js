const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads a buffer to Cloudinary using a stream
 * @param {Buffer} buffer - The file buffer from Multer
 * @param {String} folder - Target folder in Cloudinary
 */
const uploadToCloudinary = (buffer, folder = "DocuGaurd") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", // Automatically detects if it's image or PDF
        type: "private", // Production-ready: Files are not public by default
      },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      },
    );

    // Convert our Buffer into a Stream and pipe it to Cloudinary
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

const generateSignedUrl = (cloudinaryId,mimeType) => {
  // We use Cloudinary's built-in URL generator

  let extension = mimeType.split('/')[1];
  
  // 2. Cloudinary prefers 'jpg' over 'jpeg'
  if (extension === 'jpeg') extension = 'jpg';
  
  return cloudinary.url(cloudinaryId, {
    secure: true,
    sign_url: true, // This adds the cryptographic signature
    type: "private", // CRITICAL: This must match how we uploaded it
    expires_at: Math.floor(Date.now() / 1000) + 300, // Expires in 300 seconds (5 mins),
    format: extension,
  });
};

module.exports = { uploadToCloudinary, generateSignedUrl };
