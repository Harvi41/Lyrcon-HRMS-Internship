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
    email: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    experience: {
        type: String,
        trim: true
    },
    skills: [{
        type: String,
        trim: true
    }],
    resumeText: {
        type: String,
        trim: true
    },
    jobRequirements: {
        type: String,
        trim: true
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    matchedSkills: [{
        type: String,
        trim: true
    }],
    missingSkills: [{
        type: String,
        trim: true
    }],
    aiSummary: {
        type: String,
        trim: true
    },
    aiRecommendation: {
        type: String,
        enum: ['Strong Fit', 'Good Fit', 'Average Fit', 'Weak Fit', 'Manual Review'],
        default: 'Manual Review'
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
