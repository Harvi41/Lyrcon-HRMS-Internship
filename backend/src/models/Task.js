const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String, 
        trim: true,
        default: ''
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee', 
        required: true 
    },
    assignedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    priority: { 
        type: String, 
        enum: ['urgent', 'important', 'normal'], 
        default: 'normal' 
    },
    deadline: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'in-progress', 'completed'], 
        default: 'pending' 
    },
    completedAt: { 
        type: Date,
        default: null
    },
    comments: { 
        type: String, 
        trim: true,
        default: ''
    }
}, { timestamps: true });

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
