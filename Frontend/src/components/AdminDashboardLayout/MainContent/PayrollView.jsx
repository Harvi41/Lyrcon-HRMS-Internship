// PayrollView.jsx
import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';

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

    const documentationBody = `
============================================================
            COREHR MANAGEMENT PAYROLL LEDGER STATEMENT
============================================================
  Employee ID       : ${emp.id}
  Staff Name        : ${emp.name}
  Allocated Dept    : ${emp.dept}
------------------------------------------------------------
  Base Earnings Struct  : ₹${emp.baseSalary.toLocaleString('en-IN')}.00
  Regulatory Provident  : Deductions Finalized
------------------------------------------------------------
  NET CASH PAYOUT   : ₹${emp.netPayout.toLocaleString('en-IN')}.00
  TXN TRANSFER LOG  : Committed & Released
============================================================
   Generated securely via CoreHR Corporate Cloud Portal
    `;

    const blobFileElement = new Blob([documentationBody], { type: 'text/plain;charset=utf-8;' });
    const virtualAnchorNode = document.createElement('a');
    virtualAnchorNode.setAttribute('href', URL.createObjectURL(blobFileElement));
    virtualAnchorNode.setAttribute('download', `Payslip_${emp.id}_Statement.txt`);
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