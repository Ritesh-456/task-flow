const express = require('express');
const router = express.router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const { validate, registerSchema, loginSchema } = require('../middleware/validationMiddleware');

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', logoutUser);

module.exports = router;
