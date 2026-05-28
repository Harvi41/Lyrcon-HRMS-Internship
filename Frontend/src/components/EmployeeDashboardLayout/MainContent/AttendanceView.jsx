import React, { useState } from "react";
import styles from "../EmployeeDashboardLayout.module.css";

// 1. Updated LineChart to accept live component data arrays dynamically
function DynamicLineChart({ records }) {
  const W = 700;
  const H = 140;
  const PAD_X = 50;
  const PAD_Y = 20;

  // Extract hours worked into an ordered coordinate array
  const dataPoints = records.map(r => r.hours || 0);
  const maxHours = 10; // Scaled relative to standard max shifts

  // Coordinate scaling math formulas
  const getX = (index) => PAD_X + (index / (records.length - 1)) * (W - PAD_X * 2);
  const getY = (val) => H - PAD_Y - (val / maxHours) * (H - PAD_Y * 2);

  // Generate SVG path blueprints
  const pathCoordinates = dataPoints.map((val, i) => `${i === 0 ? "M" : "L"}${getX(i)},${getY(val)}`).join(" ");
  const areaFillPath = pathCoordinates ? `${pathCoordinates} L${getX(records.length - 1)},${H - PAD_Y} L${getX(0)},${H - PAD_Y} Z` : "";

  return (
    <div className={styles.chartWrap} style={{ overflowX: "auto", marginTop: "10px" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" style={{ minWidth: "500px" }}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Horizontal Background Grid Reference Helper Lines */}
        {[0, 2, 4, 6, 8, 10].map((hour) => (
          <g key={hour}>
            <line x1={PAD_X} y1={getY(hour)} x2={W - PAD_X} y2={getY(hour)} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <text x={PAD_X - 12} y={getY(hour) + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="500">{hour}h</text>
          </g>
        ))}

        {/* Shaded Area Underneath Line */}
        {areaFillPath && <path d={areaFillPath} fill="url(#chartGradient)" />}

        {/* Core Line Path */}
        {pathCoordinates && (
          <path d={pathCoordinates} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* Active Node Coordinate Circles Data Plot Highlights */}
        {dataPoints.map((val, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(val)} r="4" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
            {val > 0 && (
              <text x={getX(i)} y={getY(val) - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="#4f46e5">
                {val}h
              </text>
            )}
            {/* Day Label Text Under Nodes */}
            <text x={getX(i)} y={H - 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#64748b">
              {records[i].day.substring(0, 3)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function AttendanceView() {
  // 2. Added full 7-day week schedule logging array including Saturday & Sunday
  const [attendanceRecords] = useState([
    { day: "Monday", checkIn: "09:00 AM", checkOut: "06:00 PM", hours: 9, status: "Present" },
    { day: "Tuesday", checkIn: "10:00 AM", checkOut: "06:00 PM", hours: 8, status: "Present" },
    { day: "Wednesday", checkIn: "09:30 AM", checkOut: "05:30 PM", hours: 8, status: "Present" },
    { day: "Thursday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" },
    { day: "Friday", checkIn: "09:00 AM", checkOut: "06:00 PM", hours: 9, status: "Present" },
    { day: "Saturday", checkIn: "10:00 AM", checkOut: "02:00 PM", hours: 4, status: "Present" }, // Saturday half-day log
    { day: "Sunday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" }               // Sunday log
  ]);

  // ─── RUNTIME AGGREGATION ANALYTICS ENGINE ───
  const todayRecord = attendanceRecords[attendanceRecords.length - 3] || {}; // Fetches Friday tracking index markers contextually
  const todayStatus = todayRecord.status ? todayRecord.status.toUpperCase() : "ABSENT";
  const todayCheckIn = todayRecord.checkIn || "--";
  const todayExpectedCheckOut = todayRecord.checkOut || "--";

  // Calculates true weekly accumulated hours
  const totalHoursThisWeek = attendanceRecords.reduce((acc, curr) => acc + (curr.hours || 0), 0);

  // Calculates present days this month logic metrics
  const daysPresentThisLog = attendanceRecords.filter(r => r.status === "Present").length;
  const standardMonthBaseline = 13; 
  const finalPresentDays = standardMonthBaseline + daysPresentThisLog;
  const totalWorkingDays = 24; // Increased allocation pool to count Saturday working rosters

  return (
    <div className={styles.page}>
      
      {/* Top Metrics Row Block View */}
      <div className={styles.statRow3}>
        <div className={styles.statCard}>
          <div className={styles.statTopRow}>
            <p className={styles.statLabel}>TODAY'S STATUS</p>
            <span 
              className={styles.presentText} 
              style={{ color: todayStatus === "PRESENT" ? "var(--accent-green)" : "var(--accent-red)" }}
            >
              {todayStatus}
            </span>
          </div>
          <div className={styles.checkRow}>
            <div>
              <p className={styles.checkLabel}>CHECK-IN</p>
              <p className={styles.checkVal}>{todayCheckIn}</p>
            </div>
            <div>
              <p className={styles.checkLabel}>EXPECTED CHECK-OUT</p>
              <p className={styles.checkVal}>{todayExpectedCheckOut}</p>
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>HOURS THIS WEEK</p>
          <p className={styles.statValue}>{totalHoursThisWeek} hrs</p>
        </div>

        <div className={styles.statCard}>
          <p className={styles.statLabel}>DAYS THIS MONTH</p>
          <p className={styles.statValue}>{finalPresentDays}/{totalWorkingDays}</p>
        </div>
      </div>

      {/* Dynamic Graph Section */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Weekly Attendance Performance Graph (Hours Worked)</h3>
        <DynamicLineChart records={attendanceRecords} />
      </div>

      {/* Complete Log Output Table Grid */}
      <div className={`${styles.tableCard} ${styles.tableCardBordered}`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Day</th><th>CHECK-IN</th><th>CHECK-OUT</th><th>Hours</th><th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((r, i) => (
              <tr key={r.day || i}>
                <td className={styles.bold}>{r.day}</td>
                <td>{r.checkIn}</td>
                <td>{r.checkOut}</td>
                <td>{r.hours > 0 ? `${r.hours} hr` : "--"}</td>
                <td>
                  <span className={r.status === "Present" ? styles.badgeGreen : styles.badgeYellow}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}