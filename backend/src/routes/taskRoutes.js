const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

router.get('/', verifyToken, taskController.listTasks);
router.post('/', verifyToken, authorizeRoles('admin', 'hr'), taskController.createTask);
router.put('/:id', verifyToken, authorizeRoles('admin', 'hr'), taskController.updateTask);
router.put('/:id/status', verifyToken, taskController.updateTaskStatus);
router.delete('/:id', verifyToken, authorizeRoles('admin', 'hr'), taskController.deleteTask);

module.exports = router;
