const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

router.use(verifyToken);

router.post('/clock-in', attendanceController.clockIn);
router.post('/clock-out', attendanceController.clockOut);
router.get('/live-roster', authorizeRoles('admin', 'hr'), attendanceController.getLiveRoster);
router.get('/employee/:employeeId', authorizeRoles('admin', 'hr'), attendanceController.getEmployeeAttendance);

module.exports = router;