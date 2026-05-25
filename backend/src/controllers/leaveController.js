const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Role = require('../models/Role');
const nodemailer = require('nodemailer');

// Helper to send emails
const sendEmailNotification = async (to, subject, html) => {
    const hasSmtpCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;
    if (hasSmtpCredentials) {
        try {
            const smtpConfig = {
                host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
                port: Number(process.env.EMAIL_PORT) || 2525,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            };
            const transporter = nodemailer.createTransport(smtpConfig);
            await transporter.sendMail({
                from: '"CoreHR Notifications" <no-reply@lyrcon.com>',
                to,
                subject,
                html,
            });
            console.log(`[SMTP] Email successfully sent to ${to}`);
        } catch (error) {
            console.error('[SMTP ERROR] Failed to send email:', error.message);
        }
    } else {
        // Fallback for local testing
        console.log('\n======================================================');
        console.log(`📧  [EMAIL NOTIFICATION] To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body:\n${html.replace(/<[^>]*>?/gm, '')}`);
        console.log('======================================================\n');
    }
};

exports.getAllLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find().populate('employeeId', 'firstName lastName email');
        
        // Format for frontend
        const formattedLeaves = leaves.map(leave => {
            const startStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date(leave.startDate));
            const endStr = new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit' }).format(new Date(leave.endDate));
            
            return {
                id: leave._id,
                employee: leave.employeeId ? `${leave.employeeId.firstName} ${leave.employeeId.lastName}` : 'Unknown Employee',
                classification: leave.classification,
                chronoRange: `${startStr} - ${endStr}`,
                status: leave.status,
                employeeEmail: leave.employeeId ? leave.employeeId.email : null
            };
        });

        res.status(200).json(formattedLeaves);
    } catch (error) {
        console.error('Fetch Leaves Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.applyLeave = async (req, res) => {
    try {
        const { employeeId, classification, startDate, endDate, reason } = req.body;

        const newLeave = new Leave({
            employeeId,
            classification,
            startDate,
            endDate,
            reason
        });

        await newLeave.save();

        // 1. Notify Admin (Action Required)
        const adminRole = await Role.findOne({ name: 'Admin', isActive: true });
        if (adminRole) {
            const admins = await User.find({ role: adminRole._id, isActive: true });
            
            const employee = await Employee.findById(employeeId);
            const employeeName = employee ? `${employee.firstName} ${employee.lastName}` : 'An employee';

            for (const admin of admins) {
                await sendEmailNotification(
                    admin.email,
                    `Action Required: New Leave Request from ${employeeName}`,
                    `<div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2 style="color: #211c6d;">New Leave Request Pending Approval</h2>
                        <p>Hello ${admin.name},</p>
                        <p><strong>${employeeName}</strong> has submitted a new leave request.</p>
                        <ul>
                            <li><strong>Type:</strong> ${classification}</li>
                            <li><strong>Dates:</strong> ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}</li>
                            <li><strong>Reason:</strong> ${reason || 'N/A'}</li>
                        </ul>
                        <p>Please log in to the CoreHR dashboard to review and approve/reject this request.</p>
                    </div>`
                );
            }
        }

        res.status(201).json({ message: 'Leave request submitted successfully', leave: newLeave });
    } catch (error) {
        console.error('Apply Leave Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.processLeave = async (req, res) => {
    try {
        const { status } = req.body;
        const leaveId = req.params.id;

        if (!['Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const leave = await Leave.findByIdAndUpdate(
            leaveId,
            { $set: { status } },
            { new: true }
        ).populate('employeeId');

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        const employee = leave.employeeId;
        if (employee) {
            // 2. Notify Employee of the decision
            await sendEmailNotification(
                employee.email,
                `Leave Request ${status} - CoreHR`,
                `<div style="font-family: Arial, sans-serif; padding: 20px;">
                    <h2 style="color: ${status === 'Approved' ? '#10b981' : '#ef4444'};">Leave Request ${status}</h2>
                    <p>Hello ${employee.firstName},</p>
                    <p>Your leave request has been <strong>${status.toLowerCase()}</strong> by Management.</p>
                    <ul>
                        <li><strong>Type:</strong> ${leave.classification}</li>
                        <li><strong>Dates:</strong> ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}</li>
                    </ul>
                </div>`
            );

            // 3. Admin Override / FYI Notification to HR
            const hrRole = await Role.findOne({ name: 'HR', isActive: true });
            if (hrRole) {
                const hrUsers = await User.find({ role: hrRole._id, isActive: true });
                for (const hr of hrUsers) {
                    await sendEmailNotification(
                        hr.email,
                        `FYI: Leave Request ${status} by Admin`,
                        `<div style="font-family: Arial, sans-serif; padding: 20px;">
                            <h2 style="color: #4f46e5;">Admin Action: Leave Request ${status}</h2>
                            <p>Hello ${hr.name},</p>
                            <p>This is an FYI that an Admin has directly <strong>${status.toLowerCase()}</strong> the following leave request:</p>
                            <ul>
                                <li><strong>Employee:</strong> ${employee.firstName} ${employee.lastName}</li>
                                <li><strong>Type:</strong> ${leave.classification}</li>
                                <li><strong>Dates:</strong> ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}</li>
                            </ul>
                            <p>No further action is required from you for this request.</p>
                        </div>`
                    );
                }
            }
        }

        res.status(200).json({ message: `Leave request ${status.toLowerCase()} successfully`, leave });
    } catch (error) {
        console.error('Process Leave Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
