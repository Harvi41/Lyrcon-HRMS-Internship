const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController'); 
const { verifyToken, authorizeRoles } = require('../middlewares/auth'); 

// Authentication routes
router.post('/register-user', verifyToken, authorizeRoles('admin', 'hr'), usersController.createUser);
router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.put('/change-password', verifyToken, authController.changePassword);

module.exports = router;