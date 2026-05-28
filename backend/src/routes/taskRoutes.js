const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// 1. Get tasks (HR/Admin gets all, Employee gets theirs)
router.get('/', verifyToken, taskController.listTasks);

// 2. Create a new task (HR/Admin only)
router.post('/', verifyToken, authorizeRoles('admin', 'hr'), taskController.createTask);

// 3. Update task parameters (HR/Admin only)
router.put('/:id', verifyToken, authorizeRoles('admin', 'hr'), taskController.updateTask);

// 4. Update task status (Assignee or HR/Admin)
router.put('/:id/status', verifyToken, taskController.updateTaskStatus);

// 5. Delete task (HR/Admin only)
router.delete('/:id', verifyToken, authorizeRoles('admin', 'hr'), taskController.deleteTask);

module.exports = router;
