const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Role = require('../models/Role');
const Announcement = require('../models/Announcement');
const nodemailer = require('nodemailer');

// 📧 Core Mailer Utility Engine
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
        // Fallback for frictionless local team testing
        console.log('\n======================================================');
        console.log(`📧   [EMAIL NOTIFICATION] To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body:\n${html.replace(/<[^>]*>?/gm, '')}`);
        console.log('======================================================\n');
    }
};

const leaveController = {
    // 📩 1. APPLY FOR LEAVE (Hardened with date guards & admin email alerts)
    applyLeave: async (req, res) => {
        try {
            const { leaveType, startDate, endDate, reason } = req.body;
            const userId = req.user.userId;

            const start = new Date(startDate);
            const end = new Date(endDate);
            
            // Compare YYYY-MM-DD strings directly to prevent timezone shift bugs
            const startStr = start.toISOString().split('T')[0];
            const endStr = end.toISOString().split('T')[0];
            const todayStr = new Date().toISOString().split('T')[0];

            if (startStr > endStr) {
                return res.status(400).json({ message: "Start date cannot be after end date." });
            }
            if (startStr < todayStr) {
                return res.status(400).json({ message: "Cannot apply for leave dates in the past." });
            }

            // Guard: Prevent double-booking overlapping slots
            const overlappingLeave = await Leave.findOne({
                userId,
                status: { $in: ['Pending', 'Approved'] },
                startDate: { $lte: end },
                endDate: { $gte: start }
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

            // 🚀 Task 5 Email Trigger: Notify Admin of New Leave Submission
            try {
                const adminRole = await Role.findOne({ name: { $regex: /^admin$/i }, isActive: true });
                if (adminRole) {
                    const admins = await User.find({ role: adminRole._id, isActive: true });
                    const employeeProfile = await Employee.findOne({ userId });
                    const employeeName = employeeProfile ? `${employeeProfile.firstName} ${employeeProfile.lastName}` : req.user.name || 'An employee';

                    for (const admin of admins) {
                        await sendEmailNotification(
                            admin.email,
                            `Action Required: New Leave Request from ${employeeName}`,
                            `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                <h2 style="color: #211c6d;">New Leave Request Pending Approval</h2>
                                <p>Hello ${admin.name},</p>
                                <p><strong>${employeeName}</strong> has submitted a new leave request details:</p>
                                <ul>
                                    <li><strong>Leave Type:</strong> ${leaveType}</li>
                                    <li><strong>Duration:</strong> ${start.toLocaleDateString()} to ${end.toLocaleDateString()}</li>
                                    <li><strong>Reason:</strong> ${reason || 'N/A'}</li>
                                </ul>
                                <p>Please log in to the CoreHR dashboard to review this request.</p>
                            </div>`
                        );
                    }
                }
            } catch (mailErr) {
                console.error('Admin leave alert dispatch failure:', mailErr.message);
            }

            return res.status(201).json({ message: "Leave applied successfully", leave: savedLeave });
        } catch (error) {
            console.error("Apply Leave Error:", error);
            return res.status(500).json({ message: "Server error applying for leave", error: error.message });
        }
    },

    // 🗂️ 2. GET LOGGED-IN USER'S LEAVE HISTORY
    getMyLeaves: async (req, res) => {
        try {
            const userId = req.user.userId;
            const leaves = await Leave.find({ userId }).sort({ createdAt: -1 });
            return res.status(200).json(leaves);
        } catch (error) {
            console.error("Get My Leaves Error:", error);
            return res.status(500).json({ message: "Server error fetching leave history", error: error.message });
        }
    },

    // 🌐 GET ALL LEAVES (For Admin Dashboard Metrics & Ledgers)
    getAllLeaves: async (req, res) => {
        try {
            const allLeaves = await Leave.find()
                .populate('userId', 'name email') 
                .sort({ createdAt: -1 });

            return res.status(200).json(allLeaves);
        } catch (error) {
            console.error("Get All Leaves Error:", error);
            return res.status(500).json({ message: "Server error fetching all leaves", error: error.message });
        }
    },

    // 📋 3. GET ALL PENDING LEAVES (For Management Interface Boards)
    getPendingLeaves: async (req, res) => {
        try {
            const pendingLeaves = await Leave.find({ status: 'Pending' })
                .populate('userId', 'name email') 
                .sort({ startDate: 1 });

            return res.status(200).json(pendingLeaves);
        } catch (error) {
            console.error("Get Pending Leaves Error:", error);
            return res.status(500).json({ message: "Server error fetching manager views", error: error.message });
        }
    },

    // 🎛️ 4. APPROVE OR REJECT LEAVE (Triggers dual status notification updates)
    reviewLeave: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, comments, startDate, endDate } = req.body;
            const reviewerId = req.user.userId; 

            if (!['Approved', 'Rejected'].includes(status)) {
                return res.status(400).json({ message: "Invalid status update. Choose 'Approved' or 'Rejected'." });
            }

            const updateFields = { 
                status, 
                comments: comments || '', 
                reviewedBy: reviewerId 
            };

            if (startDate) updateFields.startDate = new Date(startDate);
            if (endDate) updateFields.endDate = new Date(endDate);

            const updatedLeave = await Leave.findByIdAndUpdate(
                id,
                { $set: updateFields },
                { returnDocument: 'after', runValidators: true } // 🧼 Clean Mongoose warning fix
            ).populate('userId', 'name email'); 

            if (!updatedLeave) {
                return res.status(404).json({ message: "Leave request record not found." });
            }

            // 🚀 Task 5 Email Trigger: Notify Employee & Dispatch FYI Alert to HR
            try {
                const targetEmployee = updatedLeave.userId;
                const employeeProfile = await Employee.findOne({ userId: targetEmployee._id });
                const employeeName = updatedLeave.userId?.name || 'Employee';

                if (targetEmployee?.email) {
                    // Alert A: Dispatch processing response directly to the worker
                    await sendEmailNotification(
                        targetEmployee.email,
                        `Leave Request ${status} - CoreHR`,
                        `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <h2 style="color: ${status === 'Approved' ? '#10b981' : '#ef4444'};">Leave Request ${status}</h2>
                            <p>Hello ${employeeName},</p>
                            <p>Your leave request has been processed with the following status: <strong>${status}</strong>.</p>
                            <ul>
                                <li><strong>Type:</strong> ${updatedLeave.leaveType}</li>
                                <li><strong>Dates:</strong> ${new Date(updatedLeave.startDate).toLocaleDateString()} to ${new Date(updatedLeave.endDate).toLocaleDateString()}</li>
                                <li><strong>Reviewer Comments:</strong> ${comments || 'None'}</li>
                            </ul>
                        </div>`
                    );
                }

                // Alert B: Drop an informational FYI mailer into HR team boxes
                const hrRole = await Role.findOne({ name: { $regex: /^hr$/i }, isActive: true });
                if (hrRole) {
                    const hrUsers = await User.find({ role: hrRole._id, isActive: true });
                    for (const hr of hrUsers) {
                        await sendEmailNotification(
                            hr.email,
                            `FYI: Leave Request ${status} Processed`,
                            `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                                <h3 style="color: #4f46e5;">HR Ledger Update: Leave ${status}</h3>
                                <p>Hello ${hr.name},</p>
                                <p>This is an automated operational notice that a leave request has been processed:</p>
                                <ul>
                                    <li><strong>Employee Name:</strong> ${employeeName}</li>
                                    <li><strong>Employee Code:</strong> ${employeeProfile?.employeeCode || 'N/A'}</li>
                                    <li><strong>Type:</strong> ${updatedLeave.leaveType}</li>
                                    <li><strong>Timeline:</strong> ${new Date(updatedLeave.startDate).toLocaleDateString()} to ${new Date(updatedLeave.endDate).toLocaleDateString()}</li>
                                    <li><strong>Final Status:</strong> ${status}</li>
                                </ul>
                            </div>`
                        );
                    }
                }

                // Alert C: Create In-App System Notification for the Employee
                try {
                    const newNotification = new Announcement({
                        sender: reviewerId,
                        title: `Leave Request ${status}`,
                        description: `Your leave request for ${updatedLeave.leaveType} from ${new Date(updatedLeave.startDate).toLocaleDateString()} to ${new Date(updatedLeave.endDate).toLocaleDateString()} has been ${status}. Comments: ${comments || 'None'}`,
                        category: 'Leave',
                        priority: 'Medium',
                        targetAudience: 'individual',
                        targetRecipient: targetEmployee._id,
                        readBy: [reviewerId]
                    });
                    await newNotification.save();
                } catch (notifErr) {
                    console.error('In-app notification creation error:', notifErr.message);
                }

            } catch (mailErr) {
                console.error('Leave response email chain dispatch error:', mailErr.message);
            }

            return res.status(200).json({ message: `Leave request status updated to ${status}`, leave: updatedLeave });
        } catch (error) {
            console.error("Review Leave Error:", error);
            return res.status(500).json({ message: "Server error updating leave allocation", error: error.message });
        }
    }
};

module.exports = leaveController;
