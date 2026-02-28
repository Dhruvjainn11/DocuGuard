const express = require('express');
const router = express.Router();
const { registerController, loginController } = require('../controllers/authController');
const {validate} = require('../middlewares/validateMiddleware');
const { registerSchema, loginSchema } = require('../validation/authValidation');

router.post('/register', validate(registerSchema), registerController);
router.post('/login', validate(loginSchema), loginController);

module.exports = router;