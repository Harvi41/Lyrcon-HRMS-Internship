const express = require('express');
const router = express.Router();
const recruitmentController = require('../controllers/recruitmentController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

router.use(verifyToken);
router.use(authorizeRoles('admin', 'hr'));

router.post('/', recruitmentController.createJobOpening);
router.get('/', recruitmentController.getJobOpenings);
router.put('/:id', recruitmentController.updateCandidateStatus);

module.exports = router;