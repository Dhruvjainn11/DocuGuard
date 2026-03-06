const express = require('express');
const router = express.Router();

const {authMiddleware} = require('../middlewares/authMiddleware');
const {getProfileController} = require('../controllers/userController');

router.get('/profile', authMiddleware, getProfileController);

module.exports = router;