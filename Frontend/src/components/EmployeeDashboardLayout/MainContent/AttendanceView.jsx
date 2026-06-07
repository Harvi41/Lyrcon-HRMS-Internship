import React, { useState, useEffect } from "react";
import styles from "../EmployeeDashboardLayout.module.css";
import ClockInModal from "../../HRDashboardLayout/MainContent/ClockInModal"; 
import ClockOutModal from "../../HRDashboardLayout/MainContent/ClockOutModal";

import API, { 
  verifyFaceAndLogin, 
  getEmployeeAttendance,
  getMyAttendanceLogs
} from "../../../lib/axios"; 

function DynamicLineChart({ records }) {
  const W = 700;
  const H = 140;
  const PAD_X = 50;
  const PAD_Y = 20;

  const dataPoints = records.map(r => r.hours || 0);
  const maxHours = 10; 

  const getX = (index) => records.length > 1 ? PAD_X + (index / (records.length - 1)) * (W - PAD_X * 2) : PAD_X;
  const getY = (val) => H - PAD_Y - (val / maxHours) * (H - PAD_Y * 2);

  const pathCoordinates = dataPoints.length > 0 ? dataPoints.map((val, i) => `${i === 0 ? "M" : "L"}${getX(i)},${getY(val)}`).join(" ") : "";
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

        {[0, 2, 4, 6, 8, 10].map((hour) => (
          <g key={hour}>
            <line x1={PAD_X} y1={getY(hour)} x2={W - PAD_X} y2={getY(hour)} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <text x={PAD_X - 12} y={getY(hour) + 4} textAnchor="end" fontSize="10" fill="#94a3b8" fontWeight="500">{hour}h</text>
          </g>
        ))}

        {areaFillPath && <path d={areaFillPath} fill="url(#chartGradient)" />}

        {pathCoordinates && (
          <path d={pathCoordinates} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        )}

        {dataPoints.map((val, i) => (
          <g key={i}>
            <circle cx={getX(i)} cy={getY(val)} r="4" fill="#ffffff" stroke="#6366f1" strokeWidth="2.5" />
            {val > 0 && (
              <text x={getX(i)} y={getY(val) - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="#4f46e5">
                {val}h
              </text>
            )}
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
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
  const [isClockOutModalOpen, setIsClockOutModalOpen] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [uiFeedbackMessage, setUiFeedbackMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('');
  const [loading, setLoading] = useState(true);

  const [attendanceRecords, setAttendanceRecords] = useState([
    { day: "Monday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" },
    { day: "Tuesday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" },
    { day: "Wednesday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" },
    { day: "Thursday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" },
    { day: "Friday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" },
    { day: "Saturday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" }, 
    { day: "Sunday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" }             
  ]);

  const formatTime = (isoString) => {
    if (!isoString || isoString === "--") return "--";
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return "--";
    }
  };

  const calculateHours = (inTime, outTime) => {
    if (!inTime) return 0;
    const end = outTime ? new Date(outTime) : new Date();
    const diffMs = end - new Date(inTime);
    const hours = diffMs / (1000 * 60 * 60);
    return Math.max(0, parseFloat(hours.toFixed(1)));
  };

  useEffect(() => {
    const fetchPersonalLogs = async () => {
      try {
        setLoading(true);
        
        let logs = [];
        const response = await getMyAttendanceLogs();
        logs = Array.isArray(response?.data) ? response.data : [];

        const todayStr = new Date().toISOString().split('T')[0];
        
        const ongoingSession = logs.length > 0 
          ? logs.find(log => log && log.date === todayStr && !log.clockOutTime && !log.clockOut)
          : null;
          
        setIsClockedIn(!!ongoingSession);

        const dayMapping = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        
        const freshWeek = [
          { day: "Monday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" },
          { day: "Tuesday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" },
          { day: "Wednesday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" },
          { day: "Thursday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" },
          { day: "Friday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" },
          { day: "Saturday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" }, 
          { day: "Sunday", checkIn: "--", checkOut: "--", hours: 0, status: "Absent" }
        ].map(item => {
          const serverMatch = logs.length > 0 ? logs.find(log => {
            if (!log || !log.date) return false;
            try {
              const logDay = dayMapping[new Date(log.date).getDay()];
              return logDay === item.day;
            } catch (e) {
              return false;
            }
          }) : null;

          if (serverMatch) {
            const checkInVal = serverMatch.clockIn || serverMatch.clockInTime;
            const checkOutVal = serverMatch.clockOut || serverMatch.clockOutTime;

            return {
              ...item,
              checkIn: formatTime(checkInVal),
              checkOut: checkOutVal ? formatTime(checkOutVal) : (serverMatch.status === "Present" ? "Running" : "--"),
              hours: calculateHours(checkInVal, checkOutVal),
              status: serverMatch.status || "Present"
            };
          }
          return item;
        });

        setAttendanceRecords(freshWeek);
      } catch (err) {
        console.error("Error reading backend synchronization streams:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPersonalLogs();
  }, [isClockedIn]);

  const handleClockButtonClick = () => {
    setUiFeedbackMessage('');
    setAlertSeverity('');
    if (!isClockedIn) {
      setIsClockInModalOpen(true);
    } else {
      setIsClockOutModalOpen(true); 
    }
  };

  const executeClockInPipeline = async ({ faceEmbedding, deviceFingerprint }) => {
    try {
      const currentUserData = JSON.parse(localStorage.getItem('corehr_user') || '{}');
      const email = currentUserData.email;

      if (!email || !faceEmbedding) {
        throw new Error("Missing email context or face scanning vectors.");
      }

      await verifyFaceAndLogin(email, faceEmbedding, deviceFingerprint);
      
      setIsClockedIn(true);
      setUiFeedbackMessage('Biometric Identity Matches! Shift session initialized.');
      setAlertSeverity('success');
    } catch (err) {
      setUiFeedbackMessage(err.response?.data?.message || err.message || 'Access Denied: Face match dropped.');
      setAlertSeverity('critical');
      throw err; 
    }
  };

  const executeClockOutPipeline = async ({ faceEmbedding, deviceFingerprint }) => {
    try {
      const currentUserData = JSON.parse(localStorage.getItem('corehr_user') || '{}');
      const email = currentUserData.email;

      if (!email || !faceEmbedding) {
        throw new Error("Missing operational parameters.");
      }

      await verifyFaceAndLogin(email, faceEmbedding, deviceFingerprint);

      setIsClockedIn(false);
      setUiFeedbackMessage('Biometric identity confirmed. Duty session successfully terminated.');
      setAlertSeverity('success');
    } catch (err) {
      setUiFeedbackMessage(err.response?.data?.message || err.message || 'Biometric validation rejected on exit.');
      setAlertSeverity('critical');
      throw err;
    }
  };

  const currentDayIndex = new Date().getDay();
  const dayMapping = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = dayMapping[currentDayIndex];
  
  const todayRecord = attendanceRecords.find(r => r.day === todayName) || {};
  const todayStatus = todayRecord.status ? todayRecord.status.toUpperCase() : "ABSENT";
  const todayCheckIn = todayRecord.checkIn || "--";
  const todayExpectedCheckOut = todayRecord.checkOut || "--";

  const totalHoursThisWeek = attendanceRecords.reduce((acc, curr) => acc + (curr.hours || 0), 0).toFixed(1);
  const daysPresentThisLog = attendanceRecords.filter(r => r.status === "Present").length;
  const standardMonthBaseline = 14; 
  const finalPresentDays = standardMonthBaseline + daysPresentThisLog;
  const totalWorkingDays = 24; 

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>Loading Enterprise Logs...</div>;
  }

  return (
    <div className={styles.page}>
      {uiFeedbackMessage && (
        <div style={{
          padding: '14px 18px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '600',
          backgroundColor: alertSeverity === 'success' ? '#f0fdf4' : '#fff1f2',
          border: `1px solid ${alertSeverity === 'success' ? '#bbf7d0' : '#fecdd3'}`,
          color: alertSeverity === 'success' ? '#16a34a' : '#e11d48',
          marginBottom: '16px', textAlign: 'left'
        }}>
          {alertSeverity === 'critical' ? '⚠️ ' : '✅ '} {uiFeedbackMessage}
        </div>
      )}

      <div className={styles.actionFilterBar} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div className={styles.staticDateBadge} style={{ fontWeight: '600', color: '#475569' }}>Terminal Biometric Node</div>
        <button 
          className={isClockedIn ? styles.dangerActionButton : styles.successActionButton}
          onClick={handleClockButtonClick}
          type="button"
          style={{ padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}
        >
          {isClockedIn ? 'Clock Out Session' : 'Clock In Shift'}
        </button>
      </div>

      <div className={styles.statRow3}>
        <div className={styles.statCard}>
          <div className={styles.statTopRow}>
            <p className={styles.statLabel}>TODAY'S STATUS</p>
            <span 
              className={styles.presentText} 
              style={{ color: todayStatus === "PRESENT" ? "#16a34a" : (todayStatus === "ABSENT" ? "#dc2626" : "#eab308"), fontWeight: '700' }}
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
              <p className={styles.checkLabel}>CURRENT SESSION</p>
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

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Weekly Attendance Performance Graph (Hours Worked)</h3>
        <DynamicLineChart records={attendanceRecords} />
      </div>

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
                <td style={{ color: r.checkOut === 'Running' ? '#eab308' : 'inherit', fontWeight: r.checkOut === 'Running' ? '700' : 'normal' }}>{r.checkOut}</td>
                <td>{r.hours > 0 ? `${r.hours} hr` : "--"}</td>
                <td>
                  <span className={r.status === "Present" ? styles.badgeGreen : r.status === "Absent" ? styles.badgeRed : styles.badgeYellow}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ClockInModal 
        isOpen={isClockInModalOpen}
        onClose={() => setIsClockInModalOpen(false)}
        onConfirmClockIn={executeClockInPipeline}
      />

      <ClockOutModal 
        isOpen={isClockOutModalOpen}
        onClose={() => setIsClockOutModalOpen(false)}
        onConfirmClockOut={executeClockOutPipeline}
      />
    </div>
  );
}