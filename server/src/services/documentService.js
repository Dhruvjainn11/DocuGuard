const Document = require("../models/Document");
const { uploadToCloudinary } = require("./fileService");
const crypto = require("crypto");
const AppError = require("../utils/appError");

const createDocumentRecord = async (docData) => {
  const document = new Document(docData);
  await document.save();
  return document;
};

const uploadDocument = async (file, userId, title) => {
  const fileHash = crypto
    .createHash("sha256")
    .update(file.buffer)
    .digest("hex");
  const existingDoc = await Document.findOne({
    user: userId,
    fileHash: fileHash,
  });

  if (existingDoc) {
    throw new AppError(
      "Duplicate file: You have already uploaded this exact document.",
      409,
    );
  }

  const cloudinaryResult = await uploadToCloudinary(file.buffer);

  const docData = {
    title: title || file.originalname,
    originalFilename: file.originalname,
    user: userId,
    cloudinaryId: cloudinaryResult.public_id,
    fileType: file.mimetype,
    fileSize: file.size,
    fileHash: fileHash,
  };

  return await createDocumentRecord(docData);
};

module.exports = { createDocumentRecord, uploadDocument };
