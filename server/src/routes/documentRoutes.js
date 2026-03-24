const express = require("express");
const router = express.Router();
const {
  uploadDocumentController,
  getAllDocumentsController,
  getSingleDocumentcontroller,
  moveToTrashController,
  getViewUrlController,
  restoreDocumentController,
  permanentlyDeleteController,
  analyzeDocumentController,
  saveDocumentController,
} = require("../controllers/documentController");
const { authMiddleware } = require("../middlewares/authMiddleware");
const { uploadMiddleware } = require("../middlewares/uploadMiddleware");
const { documentUploadLimiter } = require("../middlewares/rateLimiterMiddleware");

router.use(authMiddleware);

router.post(
  "/upload",
  documentUploadLimiter,
  uploadMiddleware,
  uploadDocumentController,
);
router.get("/",  getAllDocumentsController);
router.get("/:id",  getSingleDocumentcontroller);
router.delete("/:id",  moveToTrashController);
router.get("/:id/view",  getViewUrlController);
router.put("/:id/restore", restoreDocumentController);
router.delete("/:id/force", permanentlyDeleteController);
router.post("/analyze", documentUploadLimiter, uploadMiddleware, analyzeDocumentController);
router.post("/save", documentUploadLimiter, uploadMiddleware, saveDocumentController);

module.exports = router;
