const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const documentRoutes = require('./documentRoutes');

router.use('/auth', authRoutes);
router.use('/document',documentRoutes );

module.exports = router;