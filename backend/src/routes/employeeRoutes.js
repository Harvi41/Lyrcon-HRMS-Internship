const router = require('express').Router();
const controller = require('../controllers/employeeController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

router.use(verifyToken, authorizeRoles('admin', 'hr'));

router.get('/', controller.getAllEmployees);
router.get('/:id', controller.getEmployeeById);
router.post('/', controller.createEmployee);
router.patch('/:id', controller.updateEmployee);
router.delete('/:id', controller.deleteEmployee);

module.exports = router;