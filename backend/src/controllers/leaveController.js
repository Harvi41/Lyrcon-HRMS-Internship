const Leave = require('../models/Leave');

const leaveController = {
    // 📩 1. APPLY FOR LEAVE (Hardened against edge cases)
    applyLeave: async (req, res) => {
        try {
            const { leaveType, startDate, endDate, reason } = req.body;
            const userId = req.user.userId;

            const start = new Date(startDate);
            const end = new Date(endDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0); 

            if (start > end) {
                return res.status(400).json({ message: "Start date cannot be after end date." });
            }
            if (start < today) {
                return res.status(400).json({ message: "Cannot apply for leave dates in the past." });
            }

            const overlappingLeave = await Leave.findOne({
                userId,
                status: { $in: ['Pending', 'Approved'] },
                $or: [
                    { startDate: { $lte: end }, endDate: { $gte: start } }
                ]
            });

            if (overlappingLeave) {
                return res.status(400).json({ 
                    message: `You already have a ${overlappingLeave.status.toLowerCase()} leave request within this date range.` 
                });
            }

            const newLeave = new Leave({
                userId,
                leaveType,
                startDate: start,
                endDate: end,
                reason
            });

            const savedLeave = await newLeave.save();
            res.status(201).json({ message: "Leave applied successfully", leave: savedLeave });
        } catch (error) {
            console.error("Apply Leave Error:", error);
            res.status(500).json({ message: "Server error applying for leave", error: error.message });
        }
    },

    // 🗂️ 2. GET LOGGED-IN USER'S LEAVE HISTORY
    getMyLeaves: async (req, res) => {
        try {
            const userId = req.user.userId;
            const leaves = await Leave.find({ userId }).sort({ createdAt: -1 });
            res.status(200).json(leaves);
        } catch (error) {
            console.error("Get My Leaves Error:", error);
            res.status(500).json({ message: "Server error fetching leave history", error: error.message });
        }
    },

    // 📋 3. GET ALL PENDING LEAVES 
    getPendingLeaves: async (req, res) => {
        try {
            const pendingLeaves = await Leave.find({ status: 'Pending' })
                .populate('userId', 'name email') 
                .sort({ startDate: 1 });

            res.status(200).json(pendingLeaves);
        } catch (error) {
            console.error("Get Pending Leaves Error:", error);
            res.status(500).json({ message: "Server error fetching manager views", error: error.message });
        }
    },

    // 🎛️ 4. APPROVE OR REJECT LEAVE 
    reviewLeave: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, comments } = req.body;
            const reviewerId = req.user.userId; 

            if (!['Approved', 'Rejected'].includes(status)) {
                return res.status(400).json({ message: "Invalid status update. Choose 'Approved' or 'Rejected'." });
            }

            const updatedLeave = await Leave.findByIdAndUpdate(
                id,
                { 
                    $set: { 
                        status, 
                        comments: comments || '', 
                        reviewedBy: reviewerId 
                    } 
                },
                { new: true, runValidators: true }
            ).populate('userId', 'name email'); 

            if (!updatedLeave) {
                return res.status(404).json({ message: "Leave request record not found." });
            }

            res.status(200).json({ message: `Leave request status updated to ${status}`, leave: updatedLeave });
        } catch (error) {
            console.error("Review Leave Error:", error);
            res.status(500).json({ message: "Server error updating leave allocation", error: error.message });
        }
    }
};

module.exports = leaveController;