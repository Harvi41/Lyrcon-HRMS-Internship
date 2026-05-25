const mongoose = require('mongoose');
const Leave = require('./src/models/Leave');
const Employee = require('./src/models/Employee');
require('dotenv').config();

async function seedTestLeave() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        // Find any employee to attach the leave to
        const employee = await Employee.findOne();
        if (!employee) {
            console.log('No employee found in DB to attach a leave to.');
            process.exit(1);
        }

        const newLeave = new Leave({
            employeeId: employee._id,
            classification: 'Sick Leave (SL)',
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 2)), // 2 days from now
            status: 'Pending',
            reason: 'Feeling under the weather',
        });

        await newLeave.save();
        console.log('Successfully seeded a test leave request!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedTestLeave();
