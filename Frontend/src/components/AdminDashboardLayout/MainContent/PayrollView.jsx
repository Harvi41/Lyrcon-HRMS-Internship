import React, { useState, useEffect } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import { getAllEmployees, getMonthlyPayrollDashboard, getYearlyPayrollDashboard, downloadPayslipPDF } from '../../../lib/axios';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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
  
  const [yearlyRecords, setYearlyRecords] = useState([]);
  const [yearlyGraphData, setYearlyGraphData] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch all employees
      const empRes = await getAllEmployees();
      const emps = empRes.data?.data || empRes.data || [];
      const activeEmps = emps.filter(e => !e.isDeleted);

      // 2. Fetch payrolls for the current month
      const payRes = await getMonthlyPayrollDashboard(currentMonth);
      const records = payRes.data || [];
      
      // Extract terminated employees who still have payroll records this month
      const terminatedEmpsWithRecords = [];
      records.forEach(p => {
        if (p.employeeId && !activeEmps.find(e => e._id === (p.employeeId._id || p.employeeId))) {
          terminatedEmpsWithRecords.push({
            _id: p.employeeId._id || p.employeeId,
            firstName: p.employeeSnapshot?.firstName || p.employeeId.firstName || 'Unknown',
            lastName: p.employeeSnapshot?.lastName || p.employeeId.lastName || '',
            department: p.employeeSnapshot?.department || p.employeeId.department || 'Terminated',
            designation: p.employeeSnapshot?.designation || p.employeeId.designation || '',
            baseCTC: 0,
            isTerminated: true
          });
        }
      });
      
      const allRelevantEmps = [...activeEmps, ...terminatedEmpsWithRecords];

      setEmployees(allRelevantEmps);
      setPayrollRecords(records);

      // 2.5 Fetch Yearly Analytics for Graph
      const selectedYear = currentMonth.split('-')[0];
      const yearRes = await getYearlyPayrollDashboard(selectedYear);
      const yRecords = yearRes.data || [];
      setYearlyRecords(yRecords);

      // Process Graph Data (Group by Month)
      const graphMap = {};
      // Initialize all 12 months
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      monthNames.forEach((m, idx) => {
         const monthKey = `${selectedYear}-${String(idx + 1).padStart(2, '0')}`;
         graphMap[monthKey] = { name: m, disbursed: 0, pendingPF: 0, rawMonth: monthKey };
      });

      yRecords.forEach(p => {
         if (graphMap[p.payrollMonth]) {
             if (['paid', 'processed'].includes((p.paymentStatus || '').toLowerCase())) {
                 graphMap[p.payrollMonth].disbursed += Number(p.netSalary || 0);
             }
             if (p.providentFund?.employeeContribution) {
                 graphMap[p.payrollMonth].pendingPF += Number(p.providentFund.employeeContribution);
             }
         }
      });
      setYearlyGraphData(Object.values(graphMap));

      // 3. ═══════════════════════════════════════════════════════════════════════════
      //    FAIL-SAFE HYBRID DYNAMIC SUMMARY ENGINE (FIXED PENDING PF)
      //    ═══════════════════════════════════════════════════════════════════════════
      let totalDisbursed = 0;
      let totalPF = 0;

      allRelevantEmps.forEach(emp => {
        // Cross-reference records matching the exact working table row lookup pattern
        const pRecord = records.find(p => p?.employeeId?._id === emp?._id || p?.employeeId === emp?._id);
        
        let isPaid = false;
        if (pRecord && pRecord?.paymentStatus) {
          const recordStatusClean = pRecord.paymentStatus.toLowerCase().trim();
          if (['paid', 'processed', 'draft'].includes(recordStatusClean)) {
            isPaid = true;
          }
        }

        if (isPaid && pRecord) {
          // Add directly to disbursed card metrics
          totalDisbursed += Number(pRecord.netSalary || 0);
        } else if (!emp.isTerminated) {
          // 🛠️ FAIL-SAFE: If the record is unpaid or doesn't exist yet on the backend,
          // compute an estimated 12% regulatory PF contribution from their contract base wages
          if (pRecord?.providentFund?.employeeContribution) {
            totalPF += Number(pRecord.providentFund.employeeContribution);
          } else {
            const monthlyBase = Math.round((Number(emp?.baseCTC) || 0) / 12);
            // If the employee basic salary isn't distinct, approximate it via a 50% split base
            const estimatedBasicSalary = monthlyBase > 0 ? (monthlyBase * 0.50) : 15000; 
            totalPF += Math.round(estimatedBasicSalary * 0.12); // Standard 12% statutory PF rate
          }
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

  // Combine employees and payroll records for the UI table grid safely
  const mergedData = employees.map(emp => {
     const pRecord = payrollRecords.find(p => p?.employeeId?._id === emp?._id || p?.employeeId === emp?._id);
     const monthlyBase = Math.round((emp?.baseCTC || 0) / 12);
     
     // Evaluate Status using case-insensitive normalization rules
     let status = 'Unpaid';
     if (pRecord && pRecord?.paymentStatus) {
         const recordStatusClean = pRecord.paymentStatus.toLowerCase().trim();
         if (['paid', 'processed', 'draft'].includes(recordStatusClean)) {
             status = 'Paid';
         }
     }

     return {
        ...emp,
        monthlyBase,
        payrollId: pRecord ? pRecord._id : null,
        netPayout: pRecord ? (Number(pRecord.netSalary) || 0) : 0,
        status
     };
  });

  const handleDownloadPayslipAsset = async (emp) => {
    if (emp?.status !== 'Paid' || !emp?.payrollId) return;
    try {
      const response = await downloadPayslipPDF(emp.payrollId);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${emp.firstName || 'Employee'}_${currentMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to download payslip. Ensure the payroll was fully generated.');
    }
  };

  const getDisplayPeriodLabel = () => {
    const parts = currentMonth.split('-');
    if (parts.length === 2) {
      const date = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      return date.toLocaleString('en-US', { month: 'short', year: 'numeric' }).toUpperCase();
    }
    return currentMonth;
  };

  const generateCSV = (data, filename) => {
    if (!data || data.length === 0) return alert('No data available to download.');
    
    // Convert JSON to CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const csvContent = headers + '\n' + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadMonthlyCSV = () => {
    const exportData = mergedData.map(emp => ({
       EmployeeCode: emp.employeeCode || 'N/A',
       FirstName: emp.firstName,
       LastName: emp.lastName,
       Department: emp.department,
       Designation: emp.designation,
       MonthlyBaseCTC: emp.monthlyBase,
       NetPayout: emp.netPayout,
       Status: emp.status,
       IsTerminated: emp.isTerminated ? 'Yes' : 'No'
    }));
    generateCSV(exportData, `Payroll_Summary_${currentMonth}.csv`);
  };

  const handleDownloadYearlyCSV = () => {
    const selectedYear = currentMonth.split('-')[0];
    const exportData = yearlyRecords.map(p => ({
       Month: p.payrollMonth,
       EmployeeName: p.employeeSnapshot?.firstName + ' ' + (p.employeeSnapshot?.lastName || '') || 'N/A',
       Department: p.employeeSnapshot?.department || 'N/A',
       BasicSalary: p.basicSalary || 0,
       GrossSalary: p.grossSalary || 0,
       EmployeePF: p.providentFund?.employeeContribution || 0,
       NetSalary: p.netSalary || 0,
       Status: p.paymentStatus
    }));
    generateCSV(exportData, `Yearly_Payroll_Ledger_${selectedYear}.csv`);
  };

  return (
    <div className={styles.dashboardGrid}>
      
      {/* Dynamic Summary Cards Layout Row */}
      <div className={styles.metricsRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className={styles.metricCard}>
          <h3>TOTAL DISBURSED ({getDisplayPeriodLabel()})</h3>
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

      <div className={styles.activityStream} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Analytics & Export Toolkit</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className={styles.primaryActionButton} 
                style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '8px', cursor: 'pointer', border: 'none' }} 
                onClick={handleDownloadMonthlyCSV}
              >
                 Download {getDisplayPeriodLabel()} CSV
              </button>
              <button 
                className={styles.secondaryActionButton} 
                style={{ padding: '8px 16px', fontSize: '0.9rem', borderRadius: '8px', cursor: 'pointer', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#334155', fontWeight: '600' }} 
                onClick={handleDownloadYearlyCSV}
              >
                 Download {currentMonth.split('-')[0]} Year CSV
              </button>
            </div>
        </div>

        <div style={{ width: '100%', overflowX: 'auto', minHeight: '380px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px 16px', border: '1px solid #e2e8f0' }}>
            <BarChart
              width={900}
              height={330}
              data={yearlyGraphData.length > 0 ? yearlyGraphData : [{name: 'Loading', disbursed: 0, pendingPF: 0}]}
              margin={{ top: 10, right: 30, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} tickMargin={15} interval={0} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13}} tickFormatter={(value) => `₹${value / 1000}k`} tickMargin={10} />
              <Tooltip 
                 cursor={{fill: '#f8fafc'}}
                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                 formatter={(value) => [`₹${value.toLocaleString()}`, '']}
              />
              <Legend verticalAlign="bottom" height={40} wrapperStyle={{ bottom: -10, color: '#334155', fontWeight: 500 }} />
              <Bar dataKey="disbursed" name="Total Net Disbursed" fill="#4f46e5" radius={[4, 4, 0, 0]} minPointSize={0} isAnimationActive={false} barSize={28} />
              <Bar dataKey="pendingPF" name="Provident Fund Deducted" fill="#0ea5e9" radius={[4, 4, 0, 0]} minPointSize={0} isAnimationActive={false} barSize={28} />
            </BarChart>
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
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>Loading real-time payroll data...</td></tr>
            ) : mergedData.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>No active employees found.</td></tr>
            ) : (
              mergedData.map((emp) => {
                const currentPillIsPaid = emp.status === 'Paid';
                
                return (
                  <tr key={emp._id}>
                    <td>
                      <div className={styles.userColumnCell}>
                        <strong style={{ color: '#0f172a', fontWeight: '700' }}>{emp.firstName} {emp.lastName} {emp.isTerminated ? '(Deleted)' : ''}</strong>
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
                        style={{ cursor: currentPillIsPaid ? 'pointer' : 'not-allowed' }}
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