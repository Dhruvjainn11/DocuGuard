const Document = require("../models/Document");
const { uploadToCloudinary, deleteFromCloudinary } = require("./fileService");
const crypto = require("crypto");
const AppError = require("../utils/appError");
const { generateSignedUrl } = require("./fileService");
const { extractDocumentData } = require("./aiService");
const buildQuery = require("../utils/buildQuery");

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

const getUserDocuments = async (userId, queryParams) => {
  const sortableFields = {
    title: "title",
    date: "createdAt",
    name: "title"
  };

  const { sort, page, limit, offset } = buildQuery(
    queryParams,
    sortableFields,
    queryParams.page,
    queryParams.limit
  );

  const searchQuery = { user: userId, status: queryParams.status || "active" };

  if (queryParams.search) {
    searchQuery.$or = [
      { title: { $regex: queryParams.search, $options: "i" } },
      { originalFilename: { $regex: queryParams.search, $options: "i" } },
      { "extractedData.merchantName": { $regex: queryParams.search, $options: "i" } }
    ];
  }

  const documents = await Document.find(searchQuery)
    .sort(sort)
    .skip(offset)
    .limit(limit);

  const total = await Document.countDocuments(searchQuery);

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

const restoreDocument = async (docId, userId) => {
  const document = await Document.findOneAndUpdate(
    { _id: docId, user: userId, status: 'trash' },
    { status: 'active' },
    { new: true }
  );
  if (!document) throw new AppError('Document not found in trash', 404);
  return document;
};

const permanentlyDeleteDocument = async (docId, userId) => {
  const document = await Document.findOne({ _id: docId, user: userId, status: 'trash' });
  if (!document) throw new AppError('Document not found in trash', 404);

  await deleteFromCloudinary(document.cloudinaryId);
  await Document.deleteOne({ _id: docId });
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
  // First, parse the nested JSON data
  const documentData = JSON.parse(formData.documentData);
  const { title, category, merchantName, purchaseDate, expiryDate } = documentData;
  
  const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
  const existingDoc = await Document.findOne({ user: userId, fileHash });
  
  if (existingDoc) {
    throw new AppError("Duplicate file: Document already exists in your vault.", 409);
  }

  const cloudinaryResult = await uploadToCloudinary(file.buffer);

  const docData = {
    title: title || file.originalname, // Now uses the correct title from the form
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
  restoreDocument,
  permanentlyDeleteDocument,
  analyzeDocumentOnly,
  saveDocumentWithData,
};
