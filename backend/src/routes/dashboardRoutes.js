const router = require('express').Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

router.use(verifyToken, authorizeRoles('admin', 'hr'));

router.get('/summary', dashboardController.summary);

module.exports = router;