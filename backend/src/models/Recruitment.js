const mongoose = require('mongoose');

const RecruitmentSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true 
    },
    position: { 
        type: String, 
        required: true, 
        trim: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Review', 'Shortlisted', 'Interview', 'Onboarded', 'Rejected'], 
        default: 'Pending' 
    },
    interviewDate: { 
        type: Date 
    },
    notes: { 
        type: String,
        trim: true 
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { timestamps: true });

module.exports = mongoose.model('Recruitment', RecruitmentSchema);