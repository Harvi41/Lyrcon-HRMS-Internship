const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken, checkPermission } = require('../middlewares/auth');

// Enforce global login token verification across all leave operational paths
router.use(verifyToken);

// ==========================================
// 👥 EMPLOYEE SELF-SERVICE PATHS
// ==========================================
router.post('/apply', leaveController.applyLeave);
router.get('/my-requests', leaveController.getMyLeaves);

// ==========================================
// 👔 ADMINISTRATIVE & MANAGEMENT PANEL RESTRICTIONS
// ==========================================
router.get('/pending', checkPermission('leave.review'), leaveController.getPendingLeaves);
router.put('/:id/review', checkPermission('leave.review'), leaveController.reviewLeave);

module.exports = router;