const router = require('express').Router();
const usersController = require('../controllers/usersController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

router.post('/', verifyToken, authorizeRoles('admin', 'hr'), usersController.createUser);

module.exports = router;
