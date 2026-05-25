const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        leaveType: {
            type: String,
            enum: ['Casual', 'Sick', 'Maternity', 'Paternity', 'Unpaid'], 
            required: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected'],
            default: 'Pending'
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            default: null
        },
        comments: {
            type: String, 
            default: ''
        }
    }, 
    { 
        timestamps: true 
    }
);

module.exports = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);
