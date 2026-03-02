const Document = require("../models/Document");
const { uploadToCloudinary } = require("./fileService");
const crypto = require("crypto");
const AppError = require("../utils/appError");
const { generateSignedUrl } = require("./fileService");
const { extractDocumentData } = require("./aiService");

const createDocumentRecord = async (docData) => {
  const document = new Document(docData);
  await document.save();
  return document;
};

const uploadDocument = async (file, userId, title, aiService) => {
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

  const [cloudinaryResult, extractedData] = await Promise.all([
    uploadToCloudinary(file.buffer),
    aiService ? extractDocumentData(file.buffer, file.mimetype) : Promise.resolve({})
  ]);
  console.log("Extracted Data from AI:", extractedData);

  
  const finalTitle = title || extractedData.category || file.originalname;

 const docData = {
      title: finalTitle, // Uses Gemini's smart title!
      originalFilename: file.originalname,
      user: userId,
      cloudinaryId: cloudinaryResult.public_id,
      fileType: file.mimetype,
      fileSize: file.size,
      fileHash: fileHash,
      
      extractedData: {
        category: extractedData.category || 'OTHER',
        merchantName: extractedData.merchantName,
        purchaseDate: extractedData.purchaseDate,
        expiryDate: extractedData.expiryDate
      }, 
      processingStatus: extractedData.category ? 'completed' : 'failed'
    };

  return await createDocumentRecord(docData);
};

const getUserDocuments = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  // We only fetch 'active' documents by default
  const documents = await Document.find({ user: userId, status: "active" })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Document.countDocuments({
    user: userId,
    status: "active",
  });

  return {
    documents,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
    },
  };
};

const getDocumentById = async (docId, userId) => {
  return await Document.findOne({ _id: docId, user: userId });
};

const getDocumentViewUrl = async (docId, userId) => {
  
  const document = await getDocumentById(docId, userId);
  
  if (!document) {
    throw new AppError("Document not found", 404);
  }
  
  return generateSignedUrl(document.cloudinaryId, document.fileType);
};

const moveToTrash = async (docId, userId) => {
  const document = await Document.findOneAndUpdate(
    { _id: docId, user: userId, status: "active" },
    { status: "trash" },
    { new: true },
  );

  if (!document) {
    throw new Error("Document not found or already deleted");
  }
  return document;
};

const analyzeDocumentOnly = async (file, userId) => {
  const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const existingDoc = await Document.findOne({ user: userId, fileHash });
  
  if (existingDoc) {
    throw new AppError("Duplicate file: You already have this document saved.", 409);
  }

  const extractedData = await extractDocumentData(file.buffer, file.mimetype);
  return { extractedData };
};

const saveDocumentWithData = async (file, userId, formData) => {
  const { title, category, merchantName, purchaseDate, expiryDate } = formData;
  
  const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const existingDoc = await Document.findOne({ user: userId, fileHash });
  
  if (existingDoc) {
    throw new AppError("Duplicate file: Document already exists in your vault.", 409);
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
    extractedData: {
      category: category || 'OTHER',
      merchantName: merchantName || null,
      purchaseDate: purchaseDate || null,
      expiryDate: expiryDate || null
    },
    processingStatus: 'completed'
  };

  return await createDocumentRecord(docData);
};

module.exports = {
  createDocumentRecord,
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  getDocumentViewUrl,
  moveToTrash,
  analyzeDocumentOnly,
  saveDocumentWithData,
};
