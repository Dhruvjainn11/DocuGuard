const express = require('express');
const router = express.Router();
const {uploadDocumentController} = require('../controllers/documentController');

const {authMiddleware } = require('../middlewares/authMiddleware');
const { uploadMiddleware } = require('../middlewares/uploadMiddleware'); 

router.post('/upload', authMiddleware, uploadMiddleware, uploadDocumentController);

module.exports = router;