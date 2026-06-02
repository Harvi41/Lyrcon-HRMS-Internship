const Employee = require('../models/Employee');
const Asset = require('../models/Asset');

const dashboardController = {
    summary: async (req, res) => {
        try {
            const [totalEmployees, activeEmployees, inactiveEmployees, assetTotal, damagedAssets, departmentBreakdown, recentEmployees, recentAssets] = await Promise.all([
                Employee.countDocuments(),
                Employee.countDocuments({ status: 'active' }),
                Employee.countDocuments({ status: { $in: ['inactive', 'terminated'] } }),
                Asset.countDocuments(),
                Asset.countDocuments({ damaged: true }),
                Employee.aggregate([
                    { $group: { _id: { $ifNull: ['$department', 'Unassigned'] }, count: { $sum: 1 } } },
                    { $sort: { count: -1, _id: 1 } },
                ]),
                Employee.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email department status createdAt'),
                Asset.find().sort({ createdAt: -1 }).limit(5).select('name code category status damaged createdAt'),
            ]);

            const activeWorkforceRate = totalEmployees > 0 ? (activeEmployees / totalEmployees) * 100 : 0;
            const normalizedDepartments = departmentBreakdown.map((item) => ({
                label: item._id,
                value: item.count,
            }));

            res.json({
                totalEmployees,
                activeEmployees,
                inactiveEmployees,
                activeWorkforceRate: Number(activeWorkforceRate.toFixed(1)),
                assetTotal,
                damagedAssets,
                pendingActions: damagedAssets,
                departmentBreakdown: normalizedDepartments,
                recentEmployees: recentEmployees.map((employee) => ({
                    id: employee._id,
                    name: [employee.firstName, employee.lastName].filter(Boolean).join(' '),
                    email: employee.email,
                    department: employee.department || 'Unassigned',
                    status: employee.status,
                    createdAt: employee.createdAt,
                })),
                recentAssets: recentAssets.map((asset) => ({
                    id: asset._id,
                    name: asset.name,
                    code: asset.code,
                    category: asset.category,
                    status: asset.status,
                    damaged: asset.damaged,
                    createdAt: asset.createdAt,
                })),
            });
        } catch (error) {
            console.error('Dashboard summary error:', error);
            res.status(500).json({ message: 'Failed to load dashboard summary', error: error.message });
        }
    },
    employeeSummary: async (req, res) => {
        try {
            const userId = req.user.userId;
            const Task = require('../models/Task');
            const Announcement = require('../models/Announcement');
            const Payroll = require('../models/Payroll');
            
            // Tasks metrics
            const totalTasks = await Task.countDocuments({ assigneeId: userId });
            const pendingTasksCount = await Task.countDocuments({ assigneeId: userId, status: { $ne: 'Completed' } });
            const completedTasksCount = await Task.countDocuments({ assigneeId: userId, status: 'Completed' });

            // Announcements metrics
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const announcementsThisWeek = await Announcement.countDocuments({ createdAt: { $gte: oneWeekAgo } });
            const recentAnnouncements = await Announcement.find().sort({ createdAt: -1 }).limit(3);

            // Latest Payroll
            const latestPayroll = await Payroll.findOne({ employeeId: userId }).sort({ createdAt: -1 });

            res.json({
                tasks: {
                    total: totalTasks,
                    pending: pendingTasksCount,
                    completed: completedTasksCount
                },
                announcements: {
                    thisWeek: announcementsThisWeek,
                    recent: recentAnnouncements.map(a => ({ id: a._id, title: a.title, body: a.description }))
                },
                payroll: latestPayroll ? {
                    basic: latestPayroll.basicSalary,
                    bonus: latestPayroll.bonus,
                    deductions: latestPayroll.deductions,
                    net: latestPayroll.netSalary
                } : {
                    basic: 0, bonus: 0, deductions: 0, net: 0
                }
            });
        } catch (error) {
            console.error('Employee dashboard summary error:', error);
            res.status(500).json({ message: 'Failed to load employee dashboard summary', error: error.message });
        }
    }
};

module.exports = dashboardController;