const { uploadDocument } = require('../services/documentService');
const { sendSuccess, sendError } = require('../common/response');

const uploadDocumentController = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, "Please upload a file", 400);
    }

    const savedDocument = await uploadDocument(
      req.file,
      req.user.id,
      req.body.title
    );

    return sendSuccess(res, "Document uploaded securely", savedDocument, 201);

  } catch (error) {
    console.error("Upload Error:", error);
    return sendError(res, "Failed to upload document", 500, error);
  }
};

module.exports = {  uploadDocumentController };