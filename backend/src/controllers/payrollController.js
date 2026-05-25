const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');
const Leave = require('../models/Leave');
const { generatePayslipPDF } = require('../services/pdfService');

const payrollController = {
    // 1. Core Engine: Calculate / Upsert Payroll Draft
    calculateMonthlyPayroll: async (req, res) => {
        try {
            const { employeeId, payrollMonth } = req.body; // Expects "YYYY-MM"

            if (!employeeId || !payrollMonth) {
                return res.status(400).json({ message: "Provide `employeeId` and `payrollMonth` (YYYY-MM)." });
            }

            const employee = await Employee.findOne({ _id: employeeId, isDeleted: false });
            if (!employee) {
                return res.status(404).json({ message: "Active employee profile not found." });
            }

            const baseCTC = employee.baseCTC || 0;
            if (baseCTC <= 0) {
                return res.status(400).json({ message: "Cannot process payroll: Employee baseCTC is unconfigured or 0." });
            }

            const [yearStr, monthStr] = payrollMonth.split('-');
            const year = parseInt(yearStr, 10);
            const month = parseInt(monthStr, 10);
            const totalDaysInMonth = new Date(year, month, 0).getDate();

            const monthStart = new Date(year, month - 1, 1);
            const monthEnd = new Date(year, month - 1, totalDaysInMonth, 23, 59, 59);

            // Query leave module for unapproved/unpaid slots
            const unpaidLeaveRecords = await Leave.find({
                userId: employee.userId,
                $or: [
                    { leaveType: 'Unpaid', status: 'Approved' },
                    { status: 'Rejected' }
                ],
                startDate: { $gte: monthStart },
                endDate: { $lte: monthEnd }
            });

            let lopDays = 0;
            unpaidLeaveRecords.forEach(leave => {
                const diffTime = Math.abs(new Date(leave.endDate) - new Date(leave.startDate));
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
                lopDays += diffDays;
            });

            if (lopDays > totalDaysInMonth) lopDays = totalDaysInMonth;
            const paidDays = totalDaysInMonth - lopDays;

            // Indian salary parsing logic
            const monthlyGrossCTC = Math.round(baseCTC / 12);
            const basicSalary = Math.round(monthlyGrossCTC * 0.50);
            const hraAmount = Math.round(basicSalary * 0.40);
            const specialAllowanceAmount = monthlyGrossCTC - (basicSalary + hraAmount);
            const lopDeduction = Math.round((monthlyGrossCTC / totalDaysInMonth) * lopDays);

            const employeePF = Math.round(basicSalary * 0.12);
            const employerPF = Math.round(basicSalary * 0.12);
            const professionalTax = monthlyGrossCTC > 12000 ? 200 : 0;

            const allowances = [
                { name: "House Rent Allowance (HRA)", amount: hraAmount, isTaxable: true },
                { name: "Special Allowance", amount: specialAllowanceAmount, isTaxable: true }
            ];

            const customDeductions = [{ name: "Professional Tax", amount: professionalTax }];
            const grossSalary = basicSalary + hraAmount + specialAllowanceAmount;
            
            let netSalary = grossSalary - professionalTax - employeePF - lopDeduction;
            if (netSalary < 0) netSalary = 0;

            const processedPayroll = await Payroll.findOneAndUpdate(
                { employeeId, payrollMonth },
                {
                    $set: {
                        employeeSnapshot: {
                            employeeCode: employee.employeeCode,
                            firstName: employee.firstName,
                            lastName: employee.lastName,
                            designation: employee.designation,
                            department: employee.department
                        },
                        attendance: { totalDays: totalDaysInMonth, paidDays, lopDays },
                        basicSalary,
                        allowances,
                        lopDeduction,
                        deductions: customDeductions,
                        providentFund: { employeeContribution: employeePF, employerContribution: employerPF },
                        grossSalary,
                        netSalary,
                        paymentStatus: "Draft",
                        generatedBy: req.user?.userId 
                    }
                },
                { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
            );

            return res.status(200).json({ message: "Payroll compiled successfully.", payroll: processedPayroll });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Server error during payroll mapping", error: error.message });
        }
    },

    // 2. HR Console: Bulk View Payslips for a Target Month
    getMonthlyPayrollDashboard: async (req, res) => {
        try {
            const { month } = req.query; // Expects "2026-05"
            if (!month) return res.status(400).json({ message: "Query parameter `month` (YYYY-MM) is required." });

            const records = await Payroll.find({ payrollMonth: month })
                .populate('employeeId', 'firstName lastName employeeCode department designation');
            
            return res.status(200).json(records);
        } catch (error) {
            return res.status(500).json({ message: "Server error fetching dashboard arrays", error: error.message });
        }
    },

    // 3. Workflow Phase: Update Status (Draft -> Pending Approval -> Approved)
    updatePayrollStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, remarks } = req.body;

            const validStatuses = ["Draft", "Pending Approval", "Approved", "Failed"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ message: "Invalid system status transit path." });
            }

            const updateFields = { paymentStatus: status, remarks };
            if (status === "Approved") {
                updateFields.approvedBy = req.user?.userId;
            }

            const updatedPayroll = await Payroll.findByIdAndUpdate(
                id,
                { $set: updateFields },
                { returnDocument: 'after' }
            );

            if (!updatedPayroll) return res.status(404).json({ message: "Payslip record not found." });
            return res.status(200).json({ message: `Status updated to ${status}`, payroll: updatedPayroll });
        } catch (error) {
            return res.status(500).json({ message: "Server error updating workflow state", error: error.message });
        }
    },

    // 4. Financial Release: Mark Payroll as Paid (Disbursement Logging)
    executePaymentDisbursement: async (req, res) => {
        try {
            const { id } = req.params;
            const { paymentMethod, bankName, accountNumber, ifscCode, transactionReferenceId } = req.body;

            if (!paymentMethod || !transactionReferenceId) {
                return res.status(400).json({ message: "Disbursement requires paymentMethod and transactionReferenceId." });
            }

            const updatedPayroll = await Payroll.findByIdAndUpdate(
                id,
                {
                    $set: {
                        paymentStatus: "Paid",
                        paymentMethod,
                        bankDetailsSnapshot: { bankName, accountNumber, ifscCode },
                        transactionReferenceId,
                        paymentDate: new Date()
                    }
                },
                { returnDocument: 'after' }
            );

            if (!updatedPayroll) return res.status(404).json({ message: "Payslip record not found." });
            return res.status(200).json({ message: "Payroll disbursement finalized successfully.", payroll: updatedPayroll });
        } catch (error) {
            return res.status(500).json({ message: "Server error executing payment metrics", error: error.message });
        }
    },

    // 5. Employee Self-Service Area: Fetch Self Payslip History
    getSelfPayrollHistory: async (req, res) => {
        try {
            // First, isolate this user's corporate Profile ID
            const employeeProfile = await Employee.findOne({ userId: req.user.userId });
            if (!employeeProfile) {
                return res.status(404).json({ message: "Employee company profile assignment missing." });
            }

            // Fetch only Approved or Paid records for security
            const histories = await Payroll.find({
                employeeId: employeeProfile._id,
                paymentStatus: { $in: ["Approved", "Paid"] }
            }).sort({ payrollMonth: -1 });

            return res.status(200).json(histories);
        } catch (error) {
            return res.status(500).json({ message: "Server error serving individual payload lines", error: error.message });
        }
    },

    downloadPayslip : async (req, res) => {
            try {
                const { id } = req.params;
                
                // 🛡️ Safe Extraction Check: Handle both common middleware signature variations
                const userId = req.user?.userId || req.user?.id;
                const userRole = req.user?.role;

                if (!userId) {
                    return res.status(401).json({ message: "Access Denied. User session token data is corrupt or missing." });
                }

                // 1. Target the targeted payslip record
                const payroll = await Payroll.findById(id);
                if (!payroll) {
                    return res.status(404).json({ message: "Requested payroll record not found." });
                }

                // 2. SECURITY GUARD: Workers can only download their OWN finalized statements!
                if (userRole === 'Employee') {
                    const employeeProfile = await Employee.findOne({ userId: userId });
                    
                    if (!employeeProfile || payroll.employeeId.toString() !== employeeProfile._id.toString()) {
                        return res.status(403).json({ message: "Access Denied. You cannot pull financial sheets belonging to others." });
                    }
                    if (!['Approved', 'Paid'].includes(payroll.paymentStatus)) {
                        return res.status(403).json({ message: "Access Denied. Unverified salary drafts are hidden." });
                    }
                }

                // 3. Set standard downstream streaming response header types
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename=payslip-${payroll.payrollMonth}-${id}.pdf`);

                // 4. Trigger the layout engine stream direct to browser pipeline
                const pdfStream = generatePayslipPDF(payroll);
                pdfStream.pipe(res);

            } catch (error) {
                console.error("PDF generation failure:", error);
                return res.status(500).json({ message: "Server error compiling binary document", error: error.message });
            }
        }
};

module.exports = payrollController;