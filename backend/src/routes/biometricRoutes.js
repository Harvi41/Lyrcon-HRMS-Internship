const express = require('express');
const router = express.Router();
const biometricController = require('../controllers/biometricController');
const { verifyToken } = require('../middlewares/auth');

router.post('/register-face', verifyToken, biometricController.registerFace);
router.post('/verify-face', biometricController.verifyFaceAndLogin);

module.exports = router;