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
};

module.exports = dashboardController;