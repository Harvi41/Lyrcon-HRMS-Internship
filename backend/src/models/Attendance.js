const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: String, 
        required: true
    },
    clockIn: {
        type: Date,
        required: true
    },
    clockOut: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['Present', 'Absent', 'Late', 'Half-Day'],
        default: 'Present'
    },
    deviceFingerprintUsed: {
        type: String,
        required: true
    },
    ipAddressUsed: {
        type: String,
        required: true
    }
}, { timestamps: true });

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);