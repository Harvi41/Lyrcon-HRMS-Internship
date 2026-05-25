const PDFDocument = require('pdfkit');

exports.generatePayslipPDF = (payroll) => {
    // 1. Create an absolute blank canvas with standard corporate padding margins
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    
    const { employeeSnapshot, attendance, providentFund, allowances, deductions } = payroll;

    // --- 🏦 HEADER SECTION ---
    doc.fillColor('#211c6d').fontSize(22).text('LYRCON HRMS', { align: 'left' });
    doc.fillColor('#64748b').fontSize(10).text('Operational Corporate Payroll Division', { align: 'left' });
    doc.moveDown();

    doc.fillColor('#1e293b').fontSize(14).text(`PAYSLIP FOR THE MONTH OF: ${payroll.payrollMonth}`, { align: 'center', underline: true });
    doc.moveDown(2);

    // --- 👥 EMPLOYEE DETAILS GRID ---
    doc.fillColor('#1e293b').fontSize(11);
    doc.text(`Employee Code: ${employeeSnapshot.employeeCode}`, 50, 150);
    doc.text(`Employee Name: ${employeeSnapshot.firstName} ${employeeSnapshot.lastName}`, 50, 170);
    doc.text(`Department: ${employeeSnapshot.department}`, 50, 190);
    doc.text(`Designation: ${employeeSnapshot.designation}`, 50, 210);

    // Right-aligned metadata lines
    doc.text(`Total Days: ${attendance.totalDays}`, 380, 150);
    doc.text(`Paid Days: ${attendance.paidDays}`, 380, 170);
    doc.text(`LOP Days: ${attendance.lopDays}`, 380, 190);
    doc.text(`Status: ${payroll.paymentStatus}`, 380, 210);

    // Draw a neat bounding separator horizontal line
    doc.moveTo(50, 240).lineTo(545, 240).strokeColor('#cbd5e1').lineWidth(1).stroke();

    // --- 📊 EARNINGS vs DEDUCTIONS TABLES ---
    let currentY = 260;
    doc.fillColor('#211c6d').fontSize(12).text('EARNINGS', 50, currentY);
    doc.text('DEDUCTIONS', 320, currentY);
    
    currentY += 25;
    doc.fillColor('#475569').fontSize(10);
    
    // Core Earnings Lines
    doc.text(`Basic Salary:`, 50, currentY);
    doc.text(`INR ${payroll.basicSalary.toLocaleString()}`, 200, currentY, { align: 'right', width: 70 });
    
    // Core Deductions Lines
    doc.text(`Provident Fund (PF):`, 320, currentY);
    doc.text(`INR ${providentFund.employeeContribution.toLocaleString()}`, 470, currentY, { align: 'right', width: 75 });

    // Map allowances dynamically onto left lane
    let allowanceY = currentY + 20;
    allowances.forEach((allw) => {
        doc.text(`${allw.name}:`, 50, allowanceY);
        doc.text(`INR ${allw.amount.toLocaleString()}`, 200, allowanceY, { align: 'right', width: 70 });
        allowanceY += 20;
    });

    // Map deductions dynamically onto right lane
    let deductionY = currentY + 20;
    deductions.forEach((ded) => {
        doc.text(`${ded.name}:`, 320, deductionY);
        doc.text(`INR ${ded.amount.toLocaleString()}`, 470, deductionY, { align: 'right', width: 75 });
        deductionY += 20;
    });

    // Match lowest baseline positioning
    let finalBreakY = Math.max(allowanceY, deductionY) + 20;
    doc.moveTo(50, finalBreakY).lineTo(545, finalBreakY).strokeColor('#cbd5e1').stroke();

    // --- 💰 FINAL NET SUMMARY BANNER ---
    finalBreakY += 15;
    doc.fillColor('#1e293b').fontSize(11).text(`Gross Monthly Salary: INR ${payroll.grossSalary.toLocaleString()}`, 50, finalBreakY);
    
    if (payroll.lopDeduction > 0) {
        finalBreakY += 15;
        doc.fillColor('#ef4444').text(`Loss of Pay Deduction: INR ${payroll.lopDeduction.toLocaleString()}`, 50, finalBreakY);
    }

    finalBreakY += 25;
    // Highlight Take-home payload inside a subtle gray banner block
    doc.rect(50, finalBreakY, 495, 35).fill('#f1f5f9');
    doc.fillColor('#0f172a').fontSize(13).text(`NET TAKE-HOME SALARY: INR ${payroll.netSalary.toLocaleString()}`, 70, finalBreakY + 11, { bold: true });

    // --- 🏦 TRANSACTION FOOTER NOTE ---
    if (payroll.paymentStatus === 'Paid') {
        doc.fillColor('#64748b').fontSize(9);
        doc.text(`Disbursement Mode: ${payroll.paymentMethod} | Reference ID: ${payroll.transactionReferenceId}`, 50, 720, { align: 'center' });
        doc.text(`Transaction Processed Timestamp: ${new Date(payroll.paymentDate).toUTCString()}`, 50, 735, { align: 'center' });
    }

    // Inform node pipeline that drawing commands are officially complete
    doc.end();
    return doc;
};