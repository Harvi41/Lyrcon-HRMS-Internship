// PayrollView.jsx
import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import { jsPDF } from 'jspdf';

const PayrollView = () => {
  // 1. DYNAMIC METRICS SUMMARY STATE
  const [disbursementTotal] = useState(1245000);
  const pendingPFValue = "₹1,18,400.00";

  // 2. CORE LEDGER LIST DATA SEED MATRIX
  const [payrollEmployees] = useState([
    { id: 'EMP-1001', name: 'Prince Ghevariya', dept: 'Engineering', baseSalary: 185000, netPayout: 162400, status: 'Paid' }
  ]);

  // File exporter stream generator
  const handleDownloadPayslipAsset = (emp) => {
    if (emp.status !== 'Paid') return;

    const monthName = new Date().toLocaleString('en-US', { month: 'long' });
    const doc = new jsPDF();

    // Styles & Titles
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(33, 28, 109);
    doc.text("CoreHR Management Payroll Ledger", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Salary Statement - ${monthName} ${new Date().getFullYear()}`, 105, 28, { align: "center" });

    // Employee Detils
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    doc.text(`Employee ID: ${emp.id}`, 20, 45);
    doc.text(`Staff Name: ${emp.name}`, 20, 52);
    doc.text(`Department: ${emp.dept || 'N/A'}`, 20, 59);

    // Box for financial
    doc.setLineWidth(0.5);
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 68, 170, 75);

    doc.setFont("helvetica", "bold");
    doc.text("Earnings & Regulatory Deductions", 25, 78);
    
    doc.setFont("helvetica", "normal");
    doc.text("Base Salary (Gross Earnings)", 25, 90);
    doc.text(`Rs. ${emp.baseSalary.toLocaleString('en-IN')}.00`, 180, 90, { align: "right" });

    doc.setDrawColor(230, 230, 230);
    doc.line(25, 95, 185, 95);

    doc.text("Provident Fund / Tax Withholding", 25, 105);
    const deductions = emp.baseSalary - emp.netPayout;
    doc.text(`- Rs. ${deductions.toLocaleString('en-IN')}.00`, 180, 105, { align: "right" });

    doc.line(25, 110, 185, 110);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("NET CASH PAYOUT", 25, 125);
    const netPayoutStr = `Rs. ${emp.netPayout.toLocaleString('en-IN')}.00`;
    doc.text(netPayoutStr, 180, 125, { align: "right" });

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated securely via CoreHR Corporate Cloud Portal.", 105, 160, { align: "center" });

    // Properties
    const filename = `lyrcon_${monthName.toLowerCase()}_salary.pdf`;
    doc.setProperties({
        title: filename,
        subject: `Salary Statement for ${emp.name}`,
    });

    const pdfBlobUrl = doc.output('bloburl');
    // Open in a new Chrome tab/window for the user to view using PDF viewer
    window.open(pdfBlobUrl, '_blank');
    
    // Automatically trigger a download as well
    const virtualAnchorNode = document.createElement('a');
    virtualAnchorNode.setAttribute('href', pdfBlobUrl);
    virtualAnchorNode.setAttribute('download', filename);
    virtualAnchorNode.style.visibility = 'hidden';
    document.body.appendChild(virtualAnchorNode);
    virtualAnchorNode.click();
    document.body.removeChild(virtualAnchorNode);
  };

  return (
    <div className={styles.dashboardGrid}>
      
      {/* Dynamic Summary Cards Layout Row */}
      <div className={styles.metricsRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className={styles.metricCard}>
          <h3>TOTAL DISBURSED (MONTHLY)</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>
              ₹{disbursementTotal.toLocaleString('en-IN')}.00
            </span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3>PENDING REGULATORY PF</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#ea580c' }}>{pendingPFValue}</span>
          </div>
        </div>
      </div>

      {/* Main Core Directory Table */}
      <div className={styles.activityStream}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>EMPLOYEE</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>BASE SALARY</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>NET PAYOUT (₹)</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>STATUS</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>PAYSLIP PDF</th>
            </tr>
          </thead>
          <tbody>
            {payrollEmployees.map((emp) => {
              return (
                <tr key={emp.id || emp.name}>
                  <td>
                    <div className={styles.userColumnCell}>
                      <strong style={{ color: '#0f172a', fontWeight: '700' }}>{emp.name}</strong>
                      <span className={styles.subTextEmail} style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{emp.dept}</span>
                    </div>
                  </td>
                  <td style={{ color: '#334155', fontWeight: '500' }}>₹{emp.baseSalary.toLocaleString('en-IN')}.00</td>
                  <td><strong style={{ color: '#0f172a', fontWeight: '700' }}>₹{emp.netPayout.toLocaleString('en-IN')}.00</strong></td>
                  <td>
                    {/* Synchronized status label using your explicit layout module green backdrop */}
                    <span 
                      className={`${styles.statusLabel} ${styles.badgeActive}`} 
                      style={{ 
                        display: 'inline-block', 
                        minWidth: '85px', 
                        textAlign: 'center', 
                        padding: '5px 12px', 
                        borderRadius: '12px',
                        fontWeight: '600',
                        fontSize: '0.8rem'
                      }}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.secondaryTableButton}
                      onClick={() => handleDownloadPayslipAsset(emp)}
                      type="button"
                      style={{ 
                        padding: '6px 16px', 
                        borderRadius: '6px',      /* FIXED: Configured professional small rounded border */
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollView;