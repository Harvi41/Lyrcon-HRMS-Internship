const router = require('express').Router();
const rolesController = require('../controllers/rolesController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// Only Admin and HR can mutate role permissions
router.post('/update', verifyToken, authorizeRoles('admin', 'hr'), rolesController.updatePermissions);
router.get('/', verifyToken, authorizeRoles('admin', 'hr'), rolesController.listRoles);

module.exports = router;
