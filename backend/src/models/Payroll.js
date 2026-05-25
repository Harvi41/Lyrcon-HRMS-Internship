const mongoose = require("mongoose");

const payrollSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        // Snapshot of employee info at runtime to keep historical record immutable
        employeeSnapshot: {
            employeeCode: String,
            firstName: String,
            lastName: String,
            designation: String,
            department: String,
        },
        payrollMonth: {
            type: String, // e.g. "2026-05"
            required: true,
        },

        // Attendance Metrics
        attendance: {
            totalDays: { type: Number, default: 30 },
            paidDays: { type: Number, default: 30 },
            lopDays: { type: Number, default: 0 },
        },

        // Earnings
        basicSalary: { type: Number, default: 0, min: 0 },
        allowances: [
            {
                name: { type: String, required: true }, // e.g., "HRA", "Medical"
                amount: { type: Number, default: 0, min: 0 },
                isTaxable: { type: Boolean, default: true },
            }
        ],
        overtimePayment: { type: Number, default: 0, min: 0 },
        bonus: { type: Number, default: 0, min: 0 },
        arrears: { type: Number, default: 0, min: 0 },
        reimbursements: { type: Number, default: 0, min: 0 },

        // Deductions
        lopDeduction: { type: Number, default: 0, min: 0 },
        deductions: [
            {
                name: { type: String, required: true }, // e.g., "Professional Tax"
                amount: { type: Number, default: 0, min: 0 },
            }
        ],
        taxDeductedAtSource: { type: Number, default: 0, min: 0 }, // TDS / Income Tax
        providentFund: {
            employeeContribution: { type: Number, default: 0, min: 0 },
            employerContribution: { type: Number, default: 0, min: 0 }, // Useful for Cost-to-Company (CTC) metrics
        },


        // Totals
        grossSalary: { type: Number, default: 0, min: 0 }, // basic + allowances + overtime + bonus + arrears
        netSalary: { type: Number, default: 0, min: 0 },   // gross - deductions - TDS - employeePF - lopDeduction + reimbursements

        // Payment and audit
        paymentStatus: {
            type: String,
            enum: ["Draft", "Pending Approval", "Approved", "Paid", "Failed"],
            default: "Draft",
        },
        paymentMethod: {
            type: String,
            enum: ["Bank Transfer", "Cheque", "Cash", "UPI"],
        },
        bankDetailsSnapshot: {
            bankName: String,
            accountNumber: String,
            ifscCode: String,
        },
        transactionReferenceId: { type: String, trim: true },
        paymentDate: { type: Date },
        payslipPdfUrl: { type: String },

        generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        remarks: { type: String, trim: true }
    },
    {
        timestamps: true,
    }
);

payrollSchema.index({ employeeId: 1, payrollMonth: 1 }, { unique: true });

module.exports = mongoose.model("Payroll", payrollSchema);
