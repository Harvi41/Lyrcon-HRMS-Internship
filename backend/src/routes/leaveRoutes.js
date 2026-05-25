const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// 💡 Import your authentication validation middleware layers
// Adjust these paths to match wherever your project's middleware folder lives!
const { verifyToken, checkPermission } = require('../middlewares/auth.js'); 

// 🔒 LAYER 1: Enforce global login checks across all endpoints
router.use(verifyToken);

// 👤 LAYER 2: Employee Self-Service Capabilities
router.post('/apply', leaveController.applyLeave);
router.get('/my-requests', leaveController.getMyLeaves);

// 👑 LAYER 3: Administrative / Management Panel Restrictions
router.get('/pending', checkPermission('leave.review'), leaveController.getPendingLeaves);
router.put('/:id/review', checkPermission('leave.review'), leaveController.reviewLeave);

module.exports = router;