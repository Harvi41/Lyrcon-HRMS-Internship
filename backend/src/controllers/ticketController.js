const Ticket = require('../models/Ticket');
const Employee = require('../models/Employee');

exports.createTicket = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const employee = await Employee.findOne({ userId: req.user.userId, isDeleted: false });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const { title, description, category, priority } = req.body;
        
        // Generate a random ticket ID
        const ticketId = `TKT-${Math.floor(Math.random() * 90000) + 10000}`;

        const ticket = new Ticket({
            ticketId,
            title,
            description,
            category: category || 'IT Support',
            priority: priority || 'Medium',
            employeeId: employee._id
        });

        await ticket.save();
        res.status(201).json(ticket);
    } catch (error) {
        console.error('Create Ticket Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getMyTickets = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const employee = await Employee.findOne({ userId: req.user.userId, isDeleted: false });
        if (!employee) {
            return res.status(404).json({ message: 'Employee profile not found' });
        }

        const tickets = await Ticket.find({ employeeId: employee._id }).sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Get My Tickets Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find()
            .populate('employeeId', 'firstName lastName employeeCode email')
            .sort({ createdAt: -1 });
        res.status(200).json(tickets);
    } catch (error) {
        console.error('Get All Tickets Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateTicketStatus = async (req, res) => {
    try {
        const { status, resolution } = req.body;
        const updateData = { status };
        if (resolution) {
            updateData.resolution = resolution;
        }

        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { returnDocument: 'after' }
        );

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        res.status(200).json(ticket);
    } catch (error) {
        console.error('Update Ticket Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
