const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

const OFFICE_STATIC_IP = process.env.OFFICE_PUBLIC_IP || '127.0.0.1';

const attendanceController = {
    clockIn: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { deviceFingerprint } = req.body;

            const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

            if (!deviceFingerprint) {
                return res.status(400).json({ message: "Hardware device fingerprint payload missing." });
            }

            // 🛑 SECURITY GUARD: IP Network Whitelist Check
            const cleanIp = clientIp.includes('::1') ? '127.0.0.1' : clientIp.replace(/^.*:/, '');
            if (cleanIp !== OFFICE_STATIC_IP && process.env.NODE_ENV === 'production') {
                return res.status(403).json({
                    message: `Access Denied. Outbound network '${cleanIp}' does not match the corporate office network.`
                });
            }

            const employeeProfile = await Employee.findOne({ userId, isDeleted: false });
            if (!employeeProfile) {
                return res.status(404).json({ message: "Active corporate employee assignment missing." });
            }

            // 🛑 SECURITY GUARD 2: Device Locking / Buddy-Punch Guard
            if (!employeeProfile.registeredDeviceFingerprint) {

                // 🛡️ NEW UNIQUE CHECK: Ensure NO OTHER employee has already registered this device!
                const deviceExists = await Employee.findOne({
                    registeredDeviceFingerprint: deviceFingerprint,
                    _id: { $ne: employeeProfile._id } // Not this employee
                });

                if (deviceExists) {
                    return res.status(403).json({
                        message: "Device Registration Denied. This computer is already linked to another employee's account."
                    });
                }

                // If the device is clean, lock it to this account permanently
                employeeProfile.registeredDeviceFingerprint = deviceFingerprint;
                await employeeProfile.save();

            } else if (employeeProfile.registeredDeviceFingerprint !== deviceFingerprint) {
                return res.status(403).json({
                    message: "Identity Mismatch. Attendance can only be submitted from your primary registered work computer."
                });
            }

            const todayStr = new Date().toISOString().split('T')[0];
            const currentHour = new Date().getHours();

            const recordStatus = currentHour >= 10 ? 'Late' : 'Present';

            const newLog = new Attendance({
                employeeId: employeeProfile._id,
                date: todayStr,
                clockIn: new Date(),
                status: recordStatus,
                deviceFingerprintUsed: deviceFingerprint,
                ipAddressUsed: cleanIp
            });

            await newLog.save();
            return res.status(201).json({ message: "Clock-in successful. Have a productive day!", record: newLog });

        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ message: "You have already logged your clock-in entry for today." });
            }
            console.error("Clock in processing failure:", error);
            return res.status(500).json({ message: "Server error logging attendance state", error: error.message });
        }
    },

    clockOut: async (req, res) => {
        try {
            const userId = req.user.userId;
            const todayStr = new Date().toISOString().split('T')[0];

            const employeeProfile = await Employee.findOne({ userId });
            if (!employeeProfile) return res.status(404).json({ message: "Employee profile not found." });

            const log = await Attendance.findOne({ employeeId: employeeProfile._id, date: todayStr });
            if (!log) {
                return res.status(404).json({ message: "No active clock-in log matching today's date structure." });
            }
            if (log.clockOut) {
                return res.status(400).json({ message: "You have already processed your clock-out loop for today." });
            }

            log.clockOut = new Date();
            await log.save();

            return res.status(200).json({ message: "Clock-out logged successfully. Goodbye!", record: log });
        } catch (error) {
            return res.status(500).json({ message: "Server error handling departure signature lines", error: error.message });
        }
    },

    getEmployeeAttendance: async (req, res) => {
        try {
            const { employeeId } = req.params;
            const { month } = req.query;

            let query = { employeeId };
            if (month) {
                query.date = new RegExp(`^${month}`);
            }

            const history = await Attendance.find(query).sort({ date: -1 });
            return res.status(200).json({ history });
        } catch (error) {
            return res.status(500).json({ message: "Error fetching attendance history.", error: error.message });
        }
    },

    getLiveRoster: async (req, res) => {
        try {
            const todayStr = new Date().toISOString().split('T')[0];

            const activeLogs = await Attendance.find({ date: todayStr })
                .populate('employeeId', 'firstName lastName department designation');

            return res.status(200).json({
                date: todayStr,
                totalPresent: activeLogs.length,
                roster: activeLogs
            });
        } catch (error) {
            return res.status(500).json({ message: "Error compiling live roster.", error: error.message });
        }
    },

    getMyLogs: async (req, res) => {
        try {
            const userId = req.user?.userId || req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Unable to determine authenticated user." });
            }

            const employeeProfile = await Employee.findOne({ userId });
            if (!employeeProfile) {
                return res.status(404).json({ message: "Employee profile not found." });
            }

            const logs = await Attendance.find({ employeeId: employeeProfile._id })
                .sort({ date: -1 })
                .limit(30)
                .lean();

            const sanitizedLogs = logs.map(log => {
                const serializedDate = log.date
                    ? typeof log.date === 'string'
                        ? log.date.split('T')[0]
                        : log.date instanceof Date
                            ? log.date.toISOString().split('T')[0]
                            : null
                    : null;

                const fallbackDate = serializedDate ||
                    (log.clockIn ? new Date(log.clockIn).toISOString().split('T')[0] :
                     log.clockOut ? new Date(log.clockOut).toISOString().split('T')[0] :
                     '');

                return {
                    ...log,
                    date: fallbackDate,
                    clockIn: log.clockIn ? new Date(log.clockIn).toISOString() : null,
                    clockOut: log.clockOut ? new Date(log.clockOut).toISOString() : null,
                    clockInTime: log.clockIn ? new Date(log.clockIn).toISOString() : null,
                    clockOutTime: log.clockOut ? new Date(log.clockOut).toISOString() : null,
                    status: log.status || 'Absent',
                };
            });

            return res.status(200).json(sanitizedLogs);
        } catch (error) {
            console.error("Error inside getMyLogs:", error);
            return res.status(500).json({ message: "Error fetching personal logs.", error: error.message });
        }
    }
};

module.exports = attendanceController;