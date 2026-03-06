const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const documentRoutes = require('./documentRoutes');
const userRoutes = require('./userRoutes');

router.use('/auth', authRoutes);
router.use('/document',documentRoutes );
router.use('/user', userRoutes)

module.exports = router;