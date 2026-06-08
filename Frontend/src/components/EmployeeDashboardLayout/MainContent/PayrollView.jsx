import React, { useState, useEffect } from "react";
import styles from "../EmployeeDashboardLayout.module.css";
import { getMyPayroll, downloadPayslipPDF } from "../../../lib/axios";

export default function PayrollView() {
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const fetchPayroll = async () => {
    try {
      setLoading(true);
      const response = await getMyPayroll();
      
      // ═══════════════════════════════════════════════════════════════════════════
      // ✅ DEFENSIVE DATA DESERIALIZATION UNPACKING
      // Extracts payload regardless if backend wraps data or returns a raw array list
      // ═══════════════════════════════════════════════════════════════════════════
      const rawData = response?.data?.data || response?.data || response || [];
      const cleanArray = Array.isArray(rawData) ? rawData : [rawData];

      const mapped = cleanArray.map(r => {
        const calcBonus = Array.isArray(r.allowances) 
           ? r.allowances.reduce((sum, a) => sum + (a.amount || 0), 0)
           : Number(r.bonus || 0);
           
        const calcDeductions = (Number(r.lopDeduction) || 0) 
           + (Number(r.providentFund?.employeeContribution) || 0) 
           + (Array.isArray(r.deductions) ? r.deductions.reduce((sum, d) => sum + (d.amount || 0), 0) : Number(r.deductions || 0));

        return {
          id: r._id || Math.random().toString(),
          month: r.payrollMonth || r.month || "Unknown Month", 
          basic: formatCurrency(r.basicSalary || r.baseCTC),
          bonus: formatCurrency(calcBonus),
          deductions: formatCurrency(calcDeductions),
          net: formatCurrency(r.netSalary || r.netPay || 0),
          rawNetNum: r.netSalary || r.netPay || 0,
          status: r.paymentStatus || r.status || "Processed",
          date: formatDateDisplay(r.paymentDate || r.createdAt)
        };
      });

      setPayrollHistory(mapped);
    } catch (error) {
      console.error("Failed to fetch payroll history streams from server node:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    if (!val && val !== 0) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2
    }).format(val);
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return "—";
    try {
      const options = { month: 'long', day: 'numeric', year: 'numeric' };
      return new Date(dateString).toLocaleDateString('en-US', options);
    } catch (e) {
      return "—";
    }
  };

  // 3. Dynamic Calculation Engine
  const latestPayslip = payrollHistory[0] || { net: "₹0.00" };
  const currentSalaryDisplay = latestPayslip.net;

  // Static target indicator flag for upcoming pay schedules
  const nextScheduledPaymentDate = "End of Current Month";

  const handleDownloadSlipPDF = async (record) => {
    try {
      const response = await downloadPayslipPDF(record.id);
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      const cleanMonth = (record.month || "Payslip").replace(/\s+/g, "_");
      link.setAttribute('download', `Payslip_${cleanMonth}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(err);
      alert('Failed to download PDF payslip. Please try again.');
    }
  };

  const handleDownloadFullCSV = () => {
    try {
      const csvRows = [
        ["Month", "Basic Salary", "Bonus", "Deductions", "Net Salary", "Status", "Payment Date"]
      ];

      payrollHistory.forEach(r => {
        csvRows.push([
          r.month,
          r.basic,
          r.bonus,
          r.deductions,
          r.net,
          r.status,
          r.date
        ]);
      });

      const csvContent = "data:text/csv;charset=utf-8," 
        + csvRows.map(row => row.map(val => `"${val}"`).join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const downloadLink = document.createElement("a");
      downloadLink.setAttribute("href", encodedUri);
      downloadLink.setAttribute("download", `Full_Payroll_History.csv`);
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Failed to generate file download:", err);
      alert("Something went wrong compiling your CSV download.");
    }
  };

  return (
    <div className={styles.page}>
      {/* Top Cards Section calculating live statistics from state arrays */}
      <div className={styles.statRow2}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>CURRENT MONTH SALARY</p>
          <p className={styles.statValue}>{currentSalaryDisplay}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>NEXT PAYMENT DATE</p>
          <p className={`${styles.statValue} ${styles.orange}`}>{nextScheduledPaymentDate}</p>
        </div>
      </div>

      {/* Dynamic Main Table Grid */}
      <div className={styles.tableCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 0 20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Payroll History</h3>
          <button 
            onClick={handleDownloadFullCSV}
            style={{ 
              backgroundColor: '#10b981', color: 'white', border: 'none', 
              padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
              fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Download Full CSV
          </button>
        </div>

        {loading ? (
          <p style={{ padding: "20px", textAlign: "center", color: "var(--gray-500)" }}>Loading payroll records...</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Month</th><th>Basic Salary</th><th>Bonus</th><th>Deductions</th><th>NET SALARY (₹)</th><th>STATUS</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", color: "var(--gray-500)", padding: "20px" }}>
                    No payslip history log objects found.
                  </td>
                </tr>
              ) : (
                payrollHistory.map((r) => (
                  <tr key={r.id}>
                    <td className={styles.bold}>{r.month}</td>
                    <td>{r.basic}</td>
                    <td>{r.bonus}</td>
                    <td>{r.deductions}</td>
                    <td className={styles.netPay} style={{ color: '#16a34a', fontWeight: '700' }}>{r.net}</td>
                    <td>
                      <span className={r.status?.toLowerCase() === "paid" ? styles.badgeGreen : styles.badgeYellow}>
                        {r.status || 'Processed'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={styles.iconBtn} 
                        title={`Download PDF Payslip for ${r.month}`}
                        onClick={() => handleDownloadSlipPDF(r)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}