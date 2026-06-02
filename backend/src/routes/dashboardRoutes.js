const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// HR & Admin summary
router.get('/summary', verifyToken, authorizeRoles('admin', 'hr'), dashboardController.summary);

// Employee summary
router.get('/employee/summary', verifyToken, dashboardController.employeeSummary);

module.exports = router;