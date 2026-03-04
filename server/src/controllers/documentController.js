const {
  uploadDocument,
  getUserDocuments,
  getDocumentById,
  getDocumentViewUrl,
  moveToTrash,
  analyzeDocumentOnly,
  saveDocumentWithData,
} = require("../services/documentService");
const aiService = require("../services/aiService");
const { sendSuccess, sendError } = require("../common/response");

const uploadDocumentController = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, "Please upload a file", 400);
    }

    const savedDocument = await uploadDocument(
      req.file,
      req.user.id,
      req.body.title,
      aiService,
    );

    return sendSuccess(
      res,
      "Document uploaded and analyzed",
      savedDocument,
      201,
    );
  } catch (error) {
    console.error("Upload Error:", error);
    next(error);
  }
};

const getAllDocumentsController = async (req, res, next) => {
  try {
    const result = await getUserDocuments(req.user.id, req.query);
    return sendSuccess(res, "Documents retrieved successfully", result);
  } catch (error) {
    next(error);
  }
};

const getSingleDocumentcontroller = async (req, res, next) => {
  try {
    const document = await getDocumentById(req.params.id, req.user.id);

    if (!document) {
      return sendError(res, "Document not found", 404);
    }

    return sendSuccess(res, "Document details retrieved", document);
  } catch (error) {
    next(error);
  }
};

const getViewUrlController = async (req, res, next) => {
  try {
    const secureUrl = await getDocumentViewUrl(req.params.id, req.user.id);
    return sendSuccess(res, "Secure link generated", { url: secureUrl });
  } catch (error) {
    next(error);
  }
};

const moveToTrashController = async (req, res, next) => {
  try {
    await moveToTrash(req.params.id, req.user.id);
    return sendSuccess(res, "Document moved to trash", null, 200);
  } catch (error) {
    next(error);
  }
};

const analyzeDocumentController = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, "Please upload a file to analyze", 400);
    }

    const result = await analyzeDocumentOnly(req.file, req.user.id);
    return sendSuccess(res, "Document analyzed successfully", result);
  } catch (error) {
    console.error("Analysis Error:", error);
    next(error);
  }
};

const saveDocumentController = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, "File is required to save", 400);
    }

    const savedDocument = await saveDocumentWithData(
      req.file,
      req.user.id,
      req.body,
    );
    return sendSuccess(res, "Document saved successfully", savedDocument, 201);
  } catch (error) {
    console.error("Save Error:", error);
    next(error);
  }
};

module.exports = {
  uploadDocumentController,
  getAllDocumentsController,
  getSingleDocumentcontroller,
  getViewUrlController,
  moveToTrashController,
  analyzeDocumentController,
  saveDocumentController,
};
