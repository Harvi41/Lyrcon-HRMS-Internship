import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';
import ClockInModal from './ClockInModal';
import ClockOutModal from './ClockOutModal';

const AttendanceView = () => {
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
  const [isClockOutModalOpen, setIsClockOutModalOpen] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [uiFeedbackMessage, setUiFeedbackMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState(''); 

  const [totalStaffCount] = useState(148);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [historicalTurnoutData] = useState([70, 78, 71, 85, 82, 88, 86, 92]);

  // 1. Initialize data cleanly to match your standard analytics baseline
  useEffect(() => {
    setAttendanceRecords([
      { id: 1, name: 'Prince Ghevariya', shift: '09:00 AM - 06:00 PM', compliance: 'Perfect', statusClass: styles.statusActive, isLate: false, overtime: '0.0 hrs', status: 'Present' },
      { id: 2, name: 'Michael Ross', shift: '09:45 AM', compliance: 'Late', statusClass: styles.statusOnboard, isLate: true, overtime: '0.0 hrs', status: 'Present' },
      { id: 3, name: 'Sarah Jenkins', shift: '—', compliance: 'Absent', statusClass: styles.statusLabelRed || styles.statusOnboard, isLate: false, overtime: '0.0 hrs', status: 'Absent' }
    ]);
  }, []);

  // 2. Base calculations calculated dynamically directly over state array length
  const presentCount = attendanceRecords.filter(emp => emp.status === 'Present').length;
  const lateCount = attendanceRecords.filter(emp => emp.compliance === 'Late').length;
  const absentCount = attendanceRecords.filter(emp => emp.status === 'Absent').length;

  const getTodayFormattedDate = () => {
    const today = new Date();
    const options = { month: 'short', day: 'numeric' };
    return `Date: Today (${today.toLocaleDateString('en-US', options)})`;
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ✅ RE-ENGINEERED SVG GRAPH CALCULATOR
  // ═══════════════════════════════════════════════════════════════════════════
  const buildSvgPathFromData = (dataArray) => {
    if (!dataArray || dataArray.length === 0) return '';
    
    const width = 600;
    const height = 100;
    const paddingX = 20; // Prevents clipping at start and end boundaries
    const paddingY = 15;
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;
    
    // Generate mapped coordinate items matrix
    const points = dataArray.map((val, index) => {
      const x = paddingX + (index / (dataArray.length - 1)) * chartWidth;
      // Subtract from height to invert SVG coordinates (0,0 is top-left)
      const y = height - paddingY - (val / 100) * chartHeight;
      return { x, y };
    });
    
    // Construct an absolute, space-separated command path string
    return points.reduce((str, pt, idx) => {
      return idx === 0 
        ? `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}` 
        : `${str} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    }, '');
  };

  const handleClockButtonClick = () => {
    setUiFeedbackMessage(''); 
    setAlertSeverity('');
    if (!isClockedIn) {
      setIsClockInModalOpen(true);
    } else {
      setIsClockOutModalOpen(true);
    }
  };

  // 🧪 SANDBOX MODE PIPELINE (Executes instant frontend confirmation state updates)
  const executeClockInPipeline = async (completePayload) => {
    console.log("Captured Local Biometric Package inside Dashboard Context:", completePayload);
    
    setIsClockedIn(true);
    setUiFeedbackMessage('Frontend Sandbox: Biometric verification success! Row injected.');
    setAlertSeverity('success');

    setAttendanceRecords(prevList => [
      {
        id: Date.now(),
        name: 'HR Admin (Biometric Scan)',
        shift: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Running`,
        compliance: 'Perfect',
        statusClass: styles.statusActive,
        isLate: false,
        overtime: '0.0 hrs',
        status: 'Present'
      },
      ...prevList
    ]);
  };

  const executeClockOutPipeline = async (handoverPayload) => {
    console.log("Captured Local Checkout Note Package:", handoverPayload);
    setIsClockedIn(false);
    setUiFeedbackMessage('Frontend Sandbox: Session finalized successfully.');
    setAlertSeverity('success');

    const logoutTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAttendanceRecords(prevList =>
      prevList.map(emp =>
        emp.name === 'HR Admin (Biometric Scan)' && emp.shift.includes('Running')
          ? { ...emp, shift: `${emp.shift.split(' - ')[0]} - ${logoutTimestamp}` }
          : emp
      )
    );
  };

  const handleExportSummaryCSVStream = () => {
    const columns = ['EMPLOYEE', 'SHIFT STAMP', 'COMPLIANCE METRIC', 'OVERTIME DETECT\n'];
    const dataRows = attendanceRecords.map(r => `"${r.name}","${r.shift}","${r.compliance}","${r.overtime}"`).join('\n');
    const blobFileAsset = new Blob([columns.join(',') + dataRows], { type: 'text/csv;charset=utf-8;' });
    const phantomLinkNode = document.createElement('a');
    phantomLinkNode.setAttribute('href', URL.createObjectURL(blobFileAsset));
    phantomLinkNode.setAttribute('download', `Attendance_Summary.csv`);
    phantomLinkNode.click();
  };

  return (
    <div className={styles.dashboardGrid}>
      {uiFeedbackMessage && (
        <div style={{
          gridColumn: '1 / -1', padding: '14px 18px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '600',
          backgroundColor: alertSeverity === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${alertSeverity === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: alertSeverity === 'success' ? '#15803d' : '#b91c1c', marginBottom: '-10px'
        }}>
          {uiFeedbackMessage}
        </div>
      )}

      <div className={styles.actionFilterBar}>
        <div className={styles.staticDateBadge}>{getTodayFormattedDate()}</div>
        <div className={styles.rightActionButtonGroup}>
          <button className={isClockedIn ? styles.dangerActionButton : styles.successActionButton} onClick={handleClockButtonClick} type="button">
            {isClockedIn ? 'Clock Out Now' : 'Clock In Now'}
          </button>
          <button className={styles.secondaryActionButton} onClick={handleExportSummaryCSVStream} type="button">Export Summary</button>
        </div>
      </div>

      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>PRESENT</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{136 + presentCount} / {totalStaffCount}</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>LATE ARRIVALS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.warnText}`}>{lateCount}</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>ABSENT</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.actionValue}`}>{absentCount}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════
          ✅ GRAPH STRUCTURAL STABILIZATION
          Replaced loose overflow flags with responsive layout bounds scaling properties.
         ═══════════════════════════════════════════════════════════════════════════ */}
      <div className={styles.chartContainer}>
        <h3>Monthly Turnout Graph (30-Day Trend View)</h3>
        <div className={styles.trendGraphContainer} style={{ width: '100%', marginTop: '16px' }}>
          <svg 
            viewBox="0 0 600 100" 
            width="100%" 
            height="100%" 
            preserveAspectRatio="none" 
            style={{ overflow: 'visible', display: 'block' }}
          >
            <path 
              d={buildSvgPathFromData(historicalTurnoutData)} 
              fill="none" 
              stroke="#6366f1" 
              strokeWidth="3" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className={styles.graphTimelineLabels} style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', padding: '0 10px' }}>
            <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
          </div>
        </div>
      </div>

      <div className={styles.activityStream}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>SHIFT STAMP</th>
              <th>COMPLIANCE METRIC</th>
              <th>OVERTIME DETECT</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((emp) => (
              <tr key={emp.id}>
                <td><strong>{emp.name}</strong></td>
                <td>{emp.shift}</td>
                <td><span className={`${styles.statusLabel} ${emp.statusClass}`}>{emp.compliance}</span></td>
                <td>{emp.overtime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ClockInModal isOpen={isClockInModalOpen} onClose={() => setIsClockInModalOpen(false)} onConfirmClockIn={executeClockInPipeline} />
      <ClockOutModal isOpen={isClockOutModalOpen} onClose={() => setIsClockOutModalOpen(false)} onConfirmClockOut={executeClockOutPipeline} />
    </div>
  );
};

export default AttendanceView;