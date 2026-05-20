const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Clean maps directly to the controller brains
router.post('/login', authController.login);

module.exports = router;