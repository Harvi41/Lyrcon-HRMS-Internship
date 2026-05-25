const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const rolesController = require('../controllers/rolesController'); 
const { verifyToken, checkPermission, authorizeRoles } = require('../middlewares/auth'); 

router.get('/', verifyToken, checkPermission('employee.view'), employeeController.getAllEmployees);
router.get('/:id', verifyToken, checkPermission('employee.view'), employeeController.getEmployeeById);
router.post('/', verifyToken, checkPermission('employee.create'), employeeController.createEmployee);
router.put('/:id', verifyToken, checkPermission('employee.edit'), employeeController.updateEmployee);
router.delete('/:id', verifyToken, checkPermission('employee.delete'), employeeController.deleteEmployee);

// Roles management paths
router.get('/roles', verifyToken, authorizeRoles('admin', 'hr'), rolesController.listRoles);
router.post('/roles/update', verifyToken, authorizeRoles('admin', 'hr'), rolesController.updatePermissions);

module.exports = router;