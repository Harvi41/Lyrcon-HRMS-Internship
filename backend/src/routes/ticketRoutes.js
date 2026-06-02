const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyToken, authorizeRoles } = require('../middlewares/auth');

// Employee routes
router.post('/', verifyToken, ticketController.createTicket);
router.get('/my-tickets', verifyToken, ticketController.getMyTickets);

// Admin/HR routes
router.get('/', verifyToken, authorizeRoles('admin', 'hr'), ticketController.getAllTickets);
router.put('/:id/status', verifyToken, authorizeRoles('admin', 'hr'), ticketController.updateTicketStatus);

module.exports = router;
