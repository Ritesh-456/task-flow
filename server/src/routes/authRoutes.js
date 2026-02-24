const express = require('express');
const router = express.router = express.Router();
const { registerUser, loginUser, logoutUser, superAdminRegister } = require('../controllers/authController');
const { validate, registerSchema, loginSchema, superAdminRegisterSchema } = require('../middleware/validationMiddleware');

router.post('/register', validate(registerSchema), registerUser);
router.post('/super-admin-register', validate(superAdminRegisterSchema), superAdminRegister);
router.post('/login', validate(loginSchema), loginUser);
router.post('/logout', logoutUser);

module.exports = router;
