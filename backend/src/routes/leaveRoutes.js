const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');

// In a real app, you would add authentication middleware here
// e.g. router.use(verifyToken);

router.get('/', leaveController.getAllLeaves);
router.post('/apply', leaveController.applyLeave);
router.put('/process/:id', leaveController.processLeave);

module.exports = router;
