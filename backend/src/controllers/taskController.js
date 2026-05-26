const Task = require('../models/Task');
const Employee = require('../models/Employee');
const User = require('../models/User');

const clean = (v) => String(v || '').trim();

exports.createTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, deadline } = req.body;

        if (!title || !assignedTo || !deadline) {
            return res.status(400).json({ message: 'Title, assignedTo employee and deadline are required.' });
        }

        // Verify employee exists in the database
        const employee = await Employee.findOne({ _id: assignedTo, isDeleted: false });
        if (!employee) {
            return res.status(404).json({ message: 'Assigned employee not found in database.' });
        }

        const task = await Task.create({
            title: clean(title),
            description: clean(description),
            assignedTo,
            assignedBy: req.user._id, // Set creator as the logged-in user (HR/Admin)
            priority: ['urgent', 'important', 'normal'].includes(priority) ? priority : 'normal',
            deadline: new Date(deadline),
            status: 'pending'
        });

        const populated = await Task.findById(task._id)
            .populate('assignedTo', 'firstName lastName employeeCode')
            .populate('assignedBy', 'name email');

        res.status(201).json(populated);
    } catch (error) {
        console.error('Create Task Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.listTasks = async (req, res) => {
    try {
        const roleName = req.user.roleName;

        if (roleName === 'Admin' || roleName === 'HR') {
            // HR & Admin see all tasks
            const tasks = await Task.find()
                .populate('assignedTo', 'firstName lastName employeeCode')
                .populate('assignedBy', 'name email')
                .sort({ createdAt: -1 });
            return res.json(tasks);
        } else {
            // Employee only sees tasks assigned to their Employee profile
            // Find the Employee document corresponding to the logged in User record
            const employee = await Employee.findOne({ userId: req.user._id, isDeleted: false });
            if (!employee) {
                return res.json([]); // No employee mapping means no tasks
            }

            const tasks = await Task.find({ assignedTo: employee._id })
                .populate('assignedTo', 'firstName lastName employeeCode')
                .populate('assignedBy', 'name email')
                .sort({ createdAt: -1 });
            return res.json(tasks);
        }
    } catch (error) {
        console.error('List Tasks Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { title, description, assignedTo, priority, deadline, status } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Verify assignee if changed
        if (assignedTo && String(assignedTo) !== String(task.assignedTo)) {
            const employee = await Employee.findOne({ _id: assignedTo, isDeleted: false });
            if (!employee) {
                return res.status(404).json({ message: 'New assigned employee not found in database.' });
            }
            task.assignedTo = assignedTo;
        }

        if (title) task.title = clean(title);
        if (description !== undefined) task.description = clean(description);
        if (priority && ['urgent', 'important', 'normal'].includes(priority)) task.priority = priority;
        if (deadline) task.deadline = new Date(deadline);
        if (status && ['pending', 'in-progress', 'completed'].includes(status)) {
            task.status = status;
            if (status === 'completed') {
                task.completedAt = new Date();
            } else {
                task.completedAt = null;
            }
        }

        await task.save();

        const populated = await Task.findById(task._id)
            .populate('assignedTo', 'firstName lastName employeeCode')
            .populate('assignedBy', 'name email');

        res.json(populated);
    } catch (error) {
        console.error('Update Task Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const { status, comments } = req.body;
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Security check: Employee can only update their own assigned tasks
        const roleName = req.user.roleName;
        if (roleName !== 'Admin' && roleName !== 'HR') {
            const employee = await Employee.findOne({ userId: req.user._id, isDeleted: false });
            if (!employee || String(task.assignedTo) !== String(employee._id)) {
                return res.status(403).json({ message: 'Access Denied: You can only update tasks assigned to yourself.' });
            }
        }

        if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'A valid status is required (pending, in-progress, completed)' });
        }

        task.status = status;
        if (comments !== undefined) {
            task.comments = clean(comments);
        }

        if (status === 'completed') {
            task.completedAt = new Date();
        } else {
            task.completedAt = null;
        }

        await task.save();

        const populated = await Task.findById(task._id)
            .populate('assignedTo', 'firstName lastName employeeCode')
            .populate('assignedBy', 'name email');

        res.json(populated);
    } catch (error) {
        console.error('Update Task Status Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const deleted = await Task.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully', taskId: req.params.id });
    } catch (error) {
        console.error('Delete Task Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
