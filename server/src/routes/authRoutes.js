const express = require('express');
const router = express.Router();
const { registerController, loginController, logoutController } = require('../controllers/authController');
const {validate} = require('../middlewares/validateMiddleware');
const {authMiddleware} = require('../middlewares/authMiddleware');
const { registerSchema, loginSchema } = require('../validation/authValidation');

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);
router.post('/logout', authMiddleware, logoutController)

module.exports = router;