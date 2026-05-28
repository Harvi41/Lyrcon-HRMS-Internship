import React, { useState } from "react";
import styles from "../EmployeeDashboardLayout.module.css";

// 1. Expanded structural list mock baseline data
const INITIAL_PAYROLL_ROWS = [
  { id: 1, month: "April 2026", basic: "1,38,400", bonus: "25,000", deductions: "1,000", net: "₹1,62,400.00", rawNetNum: 162400, status: "Paid", date: "April 30, 2026" },
  { id: 2, month: "March 2026", basic: "1,38,400", bonus: "10,000", deductions: "1,000", net: "₹1,47,400.00", rawNetNum: 147400, status: "Paid", date: "March 31, 2026" },
  { id: 3, month: "February 2026", basic: "1,38,400", bonus: "0", deductions: "4,000", net: "₹1,34,400.00", rawNetNum: 134400, status: "Paid", date: "February 28, 2026" },
];

export default function PayrollView() {
  // 2. Wrap dataset in component state to make it modular and dynamic
  const [payrollHistory] = useState(INITIAL_PAYROLL_ROWS);

  // 3. Dynamic Calculation Engine - grabs metrics safely from the latest chronological row
  const latestPayslip = payrollHistory[0] || { net: "₹0.00" };
  const currentSalaryDisplay = latestPayslip.net;

  // Static target indicator flag for upcoming pay schedules
  const nextScheduledPaymentDate = "May 30, 2026";

  const handleDownloadSlip = (record) => {
    try {
      const csvRows = [
        ["Month", "Basic Salary", "Bonus", "Deductions", "Net Salary", "Status"],
        [
          record.month,
          record.basic,
          record.bonus,
          record.deductions,
          record.net,
          record.status
        ]
      ];

      const csvContent = "data:text/csv;charset=utf-8," 
        + csvRows.map(row => row.map(val => `"${val}"`).join(",")).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const downloadLink = document.createElement("a");
      downloadLink.setAttribute("href", encodedUri);
      
      const cleanMonth = record.month.replace(/\s+/g, "_");
      downloadLink.setAttribute("download", `Payslip_${cleanMonth}.csv`);
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (err) {
      console.error("Failed to generate file download:", err);
      alert("Something went wrong compiling your download.");
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
                  <td className={styles.netPay}>{r.net}</td>
                  <td>
                    <span className={r.status === "Paid" ? styles.badgeGreen : styles.badgeYellow}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.iconBtn} 
                      title={`Download Payslip for ${r.month}`}
                      onClick={() => handleDownloadSlip(r)}
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
      </div>
    </div>
  );
}