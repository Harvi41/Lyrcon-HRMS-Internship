import React, { useState } from "react";
import styles from "../EmployeeDashboardLayout.module.css";

export default function EmployeeDashboardHome({ onNavigate }) {
  // 1. Managed dynamic states matching data patterns from your sub-views
  const [attendanceData] = useState([
    { day: "Mon", h: 90 },  // 9 hours worked / 10 max standard scale = 90%
    { day: "Tue", h: 80 },  // 8 hours worked = 80%
    { day: "Wed", h: 80 },  // 8 hours worked = 80%
    { day: "Thu", h: 0 },   // Absent = 0%
    { day: "Fri", h: 90 },  // 9 hours worked = 90%
    { day: "Sat", h: 40 },  // 4 hours worked = 40%
    { day: "Sun", h: 0 },   // Absent = 0%
  ]);

  const [tasks] = useState([
    { id: 1, title: "Complete Performance Review",  done: false },
    { id: 2, title: "Submit Expense Report",        done: false },
    { id: 3, title: "Team Meeting Preparation",     done: true  },
    { id: 4, title: "Update Project Documentation", done: false },
  ]);

  const [announcements] = useState([
    { id: 1, title: "All-Hands Meeting",  body: "Join us for the quarterly all hands meeting this friday at 4 PM." },
    { id: 2, title: "New Health Benefits", body: "We are excited to announce enhance health coverage starting next month" },
  ]);

  const [payroll] = useState({
    basic: 25000,
    bonus: 25000,
    deductions: 1000,
    get net() { return this.basic + this.bonus - this.deductions; }
  });

  // ─── RUNTIME RE-CALCULATION METRICS ───
  const totalTasks = tasks.length;
  const pendingTasksCount = tasks.filter((t) => !t.done).length;
  const completedTasksCount = tasks.filter((t) => t.done).length;

  // Formatting currency helper utility
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className={styles.page}>
      
      {/* Top Interactive Metric Summary Cards */}
      <div className={styles.statRow3}>
        <div className={styles.statCard} onClick={() => onNavigate("tasks")} style={{ cursor: "pointer" }}>
          <p className={styles.statLabel}>TOTAL ASSIGNED TASKS</p>
          <p className={styles.statValue}>{totalTasks}</p>
        </div>
        <div className={styles.statCard} onClick={() => onNavigate("tasks")} style={{ cursor: "pointer" }}>
          <p className={styles.statLabel}>PENDING TASKS</p>
          <p className={`${styles.statValue} ${styles.orange}`}>{pendingTasksCount}</p>
        </div>
        <div className={styles.statCard} onClick={() => onNavigate("tasks")} style={{ cursor: "pointer" }}>
          <p className={styles.statLabel}>COMPLETED TASKS</p>
          <p className={`${styles.statValue} ${styles.green}`}>{completedTasksCount}</p>
        </div>
      </div>

      {/* Workspace Dashboard Mid-Section Row */}
      <div className={styles.midRow2}>
        
        {/* Dynamic 7-Day Attendance Graph Box */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Weekly Attendance Report</h3>
          <div className={styles.barChartWrap}>
            <div className={styles.bars}>
              {attendanceData.map((b, idx) => (
                <div key={b.day || idx} className={styles.barCol}>
                  <div 
                    className={styles.bar} 
                    style={{ 
                      height: `${b.h}%`,
                      // Set an alternative color gradient layout rule if an employee was absent
                      background: b.h === 0 ? "var(--gray-200)" : "linear-gradient(180deg, #6366f1 0%, #818cf8 100%)" 
                    }} 
                    title={`${(b.h / 10)} hours worked`}
                  />
                  {/* Dynamic offset alignment based on weekend data expansion labels */}
                  <span className={styles.barLabel} style={{ left: `${(idx * 14) + 4}%` }}>{b.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Localized Payroll Summary Card */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Payroll Summary</h3>
          <div className={styles.payrollBlock}>
            <p className={styles.payLabel}>Current Month Net Take-Home</p>
            <p className={styles.payAmount} style={{ fontFamily: "Sora, sans-serif" }}>
              {formatCurrency(payroll.net)}
            </p>
          </div>
          <div className={styles.payDivider} />
          <div className={styles.payBreakdown}>
            <div>
              <p className={styles.breakLabel}>Basic Salary</p>
              <p className={styles.breakValue}>{formatCurrency(payroll.basic)}</p>
            </div>
            <div>
              <p className={styles.breakLabel}>Bonuses</p>
              <p className={styles.breakValue} style={{ color: "var(--accent-green)" }}>+{formatCurrency(payroll.bonus)}</p>
            </div>
            <div>
              <p className={styles.breakLabel}>Deductions</p>
              <p className={styles.breakValue} style={{ color: "var(--accent-red)" }}>-{formatCurrency(payroll.deductions)}</p>
            </div>
          </div>
          <button className={styles.primaryBtn} onClick={() => onNavigate("payroll")}>
            View Detailed Payslip
          </button>
        </div>
      </div>

      {/* Live Sync Announcements Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Board Announcements</h2>
        <div className={styles.announceList}>
          {announcements.length === 0 ? (
            <p style={{ color: "var(--gray-500)", fontSize: "0.875rem" }}>No announcement posts pinned yet.</p>
          ) : (
            announcements.map((a) => (
              <div key={a.id || a.title} className={styles.announceCard}>
                <p className={styles.announceTitle}>{a.title}</p>
                <p className={styles.announceBody}>{a.body}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}