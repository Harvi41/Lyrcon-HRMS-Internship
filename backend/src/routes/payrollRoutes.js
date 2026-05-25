const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { verifyToken, authorizeRoles, checkPermission } = require('../middlewares/auth');

// 👥 Employee Facing Self-Service Route
router.get('/self-history', verifyToken, payrollController.getSelfPayrollHistory);

// 👔 HR & Administrative Master Controllers
router.get('/dashboard', verifyToken, authorizeRoles('admin', 'hr'), payrollController.getMonthlyPayrollDashboard);
router.post('/calculate', verifyToken, authorizeRoles('admin', 'hr'), payrollController.calculateMonthlyPayroll);
router.put('/status/:id', verifyToken, authorizeRoles('admin', 'hr'), payrollController.updatePayrollStatus);
router.put('/disburse/:id', verifyToken, authorizeRoles('admin', 'hr'), payrollController.executePaymentDisbursement);

module.exports = router;