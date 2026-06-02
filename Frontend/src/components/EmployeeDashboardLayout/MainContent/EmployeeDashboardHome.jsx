import React, { useState, useEffect } from "react";
import styles from "../EmployeeDashboardLayout.module.css";
import API, { getEmployeeSummary } from "../../../lib/axios"; // Imported core instance alongside handlers

export default function EmployeeDashboardHome({ onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // FIXED: Converted static mock entries into a dynamic tracking matrix
  const [attendanceData, setAttendanceData] = useState([
    { day: "Mon", h: 0 },
    { day: "Tue", h: 0 },
    { day: "Wed", h: 0 },
    { day: "Thu", h: 0 },
    { day: "Fri", h: 0 },
    { day: "Sat", h: 0 },
    { day: "Sun", h: 0 },
  ]);

  useEffect(() => {
    fetchDashboardCoreData();
  }, []);

  const fetchDashboardCoreData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch task summary, payroll totals, and system announcements
      const { data } = await getEmployeeSummary();
      setSummary(data);

      // 2. Fetch secure log streams to draw the landing page bar chart elements dynamically
      const attendanceRes = await API.get('/attendance/my-logs').catch(() => ({ data: [] }));
      const userLogs = Array.isArray(attendanceRes.data) ? attendanceRes.data : [];

      if (userLogs.length > 0) {
        const dayAbbreviationMapping = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        
        // Match weekday abbreviations with actual date records from MongoDB
        const updatedHeights = [
          { day: "Mon", h: 0 }, { day: "Tue", h: 0 }, { day: "Wed", h: 0 },
          { day: "Thu", h: 0 }, { day: "Fri", h: 0 }, { day: "Sat", h: 0 }, { day: "Sun", h: 0 }
        ].map(bar => {
          const logMatch = userLogs.find(log => {
            const dateObj = new Date(log.date);
            return dayAbbreviationMapping[dateObj.getDay()] === bar.day;
          });

          if (logMatch) {
            // Scale bar height: Present defaults to 90% (9 hours), running sessions to 60%
            let computedHeight = 0;
            if (logMatch.status === "Present") {
              computedHeight = logMatch.clockOutTime ? 90 : 60;
            }
            return { ...bar, h: computedHeight };
          }
          return bar;
        });

        setAttendanceData(updatedHeights);
      }

    } catch (error) {
      console.error("Failed to compile employee dashboard summary streams:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formatting currency helper utility
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  if (loading) {
    return <div className={styles.page}><p style={{ textAlign: "center", padding: "40px", color: "var(--gray-500)" }}>Loading dashboard data...</p></div>;
  }

  const tasks = summary?.tasks || { total: 0, pending: 0, completed: 0 };
  const payroll = summary?.payroll || { basic: 0, bonus: 0, deductions: 0, net: 0 };
  const announcements = summary?.announcements?.recent || [];

  return (
    <div className={styles.page}>
      
      {/* Top Interactive Metric Summary Cards */}
      <div className={styles.statRow3}>
        <div className={styles.statCard} onClick={() => onNavigate("tasks")} style={{ cursor: "pointer" }}>
          <p className={styles.statLabel}>TOTAL ASSIGNED TASKS</p>
          <p className={styles.statValue}>{tasks.total}</p>
        </div>
        <div className={styles.statCard} onClick={() => onNavigate("tasks")} style={{ cursor: "pointer" }}>
          <p className={styles.statLabel}>PENDING TASKS</p>
          <p className={`${styles.statValue} ${styles.orange}`}>{tasks.pending}</p>
        </div>
        <div className={styles.statCard} onClick={() => onNavigate("tasks")} style={{ cursor: "pointer" }}>
          <p className={styles.statLabel}>COMPLETED TASKS</p>
          <p className={`${styles.statValue} ${styles.green}`}>{tasks.completed}</p>
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
                      background: b.h === 0 ? "var(--gray-200)" : "linear-gradient(180deg, #6366f1 0%, #818cf8 100%)",
                      transition: "height 0.4s ease-out" // Added fluid transition interpolation animation
                    }} 
                    title={`${(b.h / 10)} hours worked`}
                  />
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
              <div key={a.id} className={styles.announceCard}>
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