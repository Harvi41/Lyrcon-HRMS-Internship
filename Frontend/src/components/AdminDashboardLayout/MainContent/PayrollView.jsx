import React, { useState, useEffect } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import { getAllEmployees, getMonthlyPayrollDashboard, downloadPayslipPDF } from '../../../lib/axios';

const PayrollView = () => {
  const [employees, setEmployees] = useState([]);
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const [disbursementTotal, setDisbursementTotal] = useState(0);
  const [pendingPFValue, setPendingPFValue] = useState(0);

  // Default to current month (YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch all employees
      const empRes = await getAllEmployees();
      const emps = empRes.data?.data || empRes.data || [];
      const activeEmps = emps.filter(e => !e.isDeleted);
      setEmployees(activeEmps);

      // Fetch payrolls for the current month
      const payRes = await getMonthlyPayrollDashboard(currentMonth);
      const records = payRes.data || [];
      setPayrollRecords(records);

      // Calculate summaries
      let totalDisbursed = 0;
      let totalPF = 0;
      records.forEach(r => {
         if (r.paymentStatus === 'Paid' || r.paymentStatus === 'Processed') {
            totalDisbursed += (r.netSalary || 0);
         } else {
            totalPF += (r.providentFund?.employeeContribution || 0);
         }
      });
      setDisbursementTotal(totalDisbursed);
      setPendingPFValue(totalPF);

    } catch (err) {
      console.error('Failed to fetch payroll dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentMonth]);

  // Combine employees and payroll records for the UI
  const mergedData = employees.map(emp => {
     const pRecord = payrollRecords.find(p => p.employeeId?._id === emp._id || p.employeeId === emp._id);
     const monthlyBase = Math.round((emp.baseCTC || 0) / 12);
     
     // Evaluate Status
     let status = 'Unpaid';
     if (pRecord && pRecord.paymentStatus) {
         if (['Paid', 'Processed', 'Draft'].includes(pRecord.paymentStatus)) {
             status = 'Paid';
         }
     }

     return {
        ...emp,
        monthlyBase,
        payrollId: pRecord ? pRecord._id : null,
        netPayout: pRecord ? pRecord.netSalary : 0,
        status
     };
  });

  const handleDownloadPayslipAsset = async (emp) => {
    if (emp.status !== 'Paid') return;
    try {
      const response = await downloadPayslipPDF(emp.payrollId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${emp.firstName}_${emp.lastName}_${currentMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to download payslip. Ensure the payroll was fully generated.');
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      
      {/* Dynamic Summary Cards Layout Row */}
      <div className={styles.metricsRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className={styles.metricCard}>
          <h3>TOTAL DISBURSED ({new Date(currentMonth + '-01').toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()})</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>
              ₹{disbursementTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3>PENDING REGULATORY PF</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.warnText}`}>
               ₹{pendingPFValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Core Directory Table */}
      <div className={styles.activityStream}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Employee Payroll Ledger</h3>
            <input 
              type="month" 
              value={currentMonth} 
              onChange={(e) => setCurrentMonth(e.target.value)}
              className={styles.monthPickerInput}
            />
        </div>

        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>BASE SALARY (MONTHLY)</th>
              <th>NET PAYOUT (₹)</th>
              <th>STATUS</th>
              <th>PAYSLIP PDF</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>Loading real-time payroll data...</td></tr>
            ) : mergedData.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>No active employees found.</td></tr>
            ) : (
              mergedData.map((emp) => {
                const currentPillIsPaid = emp.status === 'Paid';
                
                return (
                  <tr key={emp._id}>
                    <td>
                      <div className={styles.userColumnCell}>
                        <strong style={{ color: '#0f172a', fontWeight: '700' }}>{emp.firstName} {emp.lastName}</strong>
                        <span className={styles.subTextEmail} style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{emp.department}</span>
                      </div>
                    </td>
                    <td style={{ color: '#334155', fontWeight: '500' }}>₹{emp.monthlyBase.toLocaleString('en-IN')}.00</td>
                    <td><strong style={{ color: '#0f172a', fontWeight: '700' }}>₹{emp.netPayout.toLocaleString('en-IN')}.00</strong></td>
                    <td>
                      <span className={currentPillIsPaid ? styles.pillPaidBadge : styles.statusOnboard} style={{ display: 'inline-block', textAlign: 'center', minWidth: '70px' }}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={currentPillIsPaid ? styles.secondaryTableButton : styles.inlineTableButtonDisabled}
                        onClick={() => handleDownloadPayslipAsset(emp)}
                        type="button"
                        disabled={!currentPillIsPaid}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollView;