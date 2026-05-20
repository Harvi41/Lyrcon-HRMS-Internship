const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken, checkPermission } = require('../middlewares/auth');

// 1. Create a new employee profile
router.post(
    '/', 
    verifyToken, 
    checkPermission('employee.create'), 
    employeeController.createEmployee
);

// 2. View all active employee profiles
router.get(
    '/', 
    verifyToken, 
    checkPermission('employee.view'), 
    employeeController.getAllEmployees
);

// 3. View a single employee profile by their ID
router.get(
    '/:id', 
    verifyToken, 
    checkPermission('employee.view'), 
    employeeController.getEmployeeById
);

// 4. Update an employee profile
router.put(
    '/:id', 
    verifyToken, 
    checkPermission('employee.edit'), 
    employeeController.updateEmployee
);

// 5. Delete an employee profile (Soft Delete)
router.delete(
    '/:id', 
    verifyToken, 
    checkPermission('employee.delete'), 
    employeeController.deleteEmployee
);

module.exports = router;