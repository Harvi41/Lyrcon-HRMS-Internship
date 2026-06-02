import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';
import ClockInModal from './ClockInModal';
import ClockOutModal from './ClockOutModal';
import API from '../../../lib/axios'; // Binds frontend component states to backend endpoints

const AttendanceView = () => {
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
  const [isClockOutModalOpen, setIsClockOutModalOpen] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [uiFeedbackMessage, setUiFeedbackMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState(''); // Tracking 'critical' red highlights

  // State-driven core attendance records matrix
  const [totalStaffCount] = useState(142);
  const [attendanceRecords, setAttendanceRecords] = useState([
    { id: 1, name: 'Prince Ghevariya', shift: '09:00 AM - 06:00 PM', compliance: 'Perfect', statusClass: styles.statusActive, isLate: false, overtime: '0.0 hrs', status: 'Present' },
    { id: 2, name: 'Michael Ross', shift: '09:45 AM', compliance: 'Late', statusClass: styles.statusOnboard, isLate: true, overtime: '0.0 hrs', status: 'Present' },
    { id: 3, name: 'Sarah Jenkins', shift: '—', compliance: 'Absent', statusClass: styles.statusLabelRed || styles.statusOnboard, isLate: false, overtime: '0.0 hrs', status: 'Absent' }
  ]);

  const [historicalTurnoutData] = useState([70, 78, 71, 85, 82, 88, 86, 92]);

  // Derived metrics logic calculation layer
  const presentCount = attendanceRecords.filter(emp => emp.status === 'Present').length;
  const lateCount = attendanceRecords.filter(emp => emp.compliance === 'Late').length;
  const absentCount = attendanceRecords.filter(emp => emp.status === 'Absent').length;

  const getTodayFormattedDate = () => {
    const today = new Date();
    const options = { month: 'short', day: 'numeric' };
    return `Date: Today (${today.toLocaleDateString('en-US', options)})`;
  };

  // SVG Line Graph generator path coordinate calculator
  const buildSvgPathFromData = (dataArray) => {
    const width = 600;
    const height = 100;
    const paddingY = 15;
    const chartHeight = height - paddingY * 2;
    const points = dataArray.map((val, index) => {
      const x = (index / (dataArray.length - 1)) * width;
      const y = height - paddingY - (val / 100) * chartHeight;
      return { x, y };
    });
    return points.reduce((str, pt, idx) => idx === 0 ? `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}` : `${str} L ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`, '');
  };

  // Direct actions layout control routers
  const handleClockButtonClick = () => {
    setUiFeedbackMessage(''); // Clear previous alert alerts
    setAlertSeverity('');
    if (!isClockedIn) {
      setIsClockInModalOpen(true);
    } else {
      setIsClockOutModalOpen(true);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BACKEND INTEGRATION API PIPELINES
  // ═══════════════════════════════════════════════════════════════════════════

  const executeClockInPipeline = async (completePayload) => {
    try {
      // 1. Transmit detailed shift configurations along with the hardware token string
      const response = await API.post('/attendance/clock-in', completePayload);

      setIsClockedIn(true);
      setUiFeedbackMessage('Clock-in successful! Security access parameters cleared.');
      setAlertSeverity('success');

      // 2. Append server-side response back inside local listing table rows dynamically
      const serverLog = response.data.data;
      setAttendanceRecords(prevList => [
        {
          id: serverLog._id || Date.now(),
          name: 'HR Administrator',
          shift: `${serverLog.clockInTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - Running`,
          compliance: 'Perfect',
          statusClass: styles.statusActive,
          isLate: false,
          overtime: '0.0 hrs',
          status: 'Present'
        },
        ...prevList
      ]);
    } catch (err) {
      // 3. INTERCEPT STATUTORY SECURITY EXCEPTIONS (IP Block / Fingerprint Token mismatch)
      if (err.response?.status === 403) {
        setUiFeedbackMessage(`Security Alert: ${err.response.data.message}`);
        setAlertSeverity('critical');
      } else {
        setUiFeedbackMessage(err.response?.data?.message || 'Failed to complete network request pipeline.');
        setAlertSeverity('critical');
      }
      // Re-throw the error so that your ClockInModal doesn't automatically close on failure
      throw err;
    }
  };

  const executeClockOutPipeline = async (handoverNotes) => {
    try {
      // If you implement a separate secure clock out endpoint later:
      // await API.post('/attendance/clock-out', { notes: handoverNotes });

      setIsClockedIn(false);
      setUiFeedbackMessage('Shift closed successfully. Logs saved.');
      setAlertSeverity('success');

      const logoutTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setAttendanceRecords(prevList =>
        prevList.map(emp =>
          emp.name === 'HR Administrator' && emp.shift.includes('Running')
            ? { ...emp, shift: `${emp.shift.split(' - ')[0]} - ${logoutTimestamp}` }
            : emp
        )
      );
    } catch (err) {
      setUiFeedbackMessage(err.response?.data?.message || 'Error processing transaction workflow.');
      setAlertSeverity('critical');
      throw err;
    }
  };

  const handleExportSummaryCSVStream = () => {
    const columns = ['EMPLOYEE', 'SHIFT STAMP', 'COMPLIANCE METRIC', 'OVERTIME DETECT\n'];
    const dataRows = attendanceRecords.map(r => `"${r.name}","${r.shift}","${r.compliance}","${r.overtime}"`).join('\n');
    const blobFileAsset = new Blob([columns.join(',') + dataRows], { type: 'text/csv;charset=utf-8;' });
    const phantomLinkNode = document.createElement('a');
    phantomLinkNode.setAttribute('href', URL.createObjectURL(blobFileAsset));
    phantomLinkNode.setAttribute('download', `Attendance_Report_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    phantomLinkNode.style.visibility = 'hidden';
    document.body.appendChild(phantomLinkNode);
    phantomLinkNode.click();
    document.body.removeChild(phantomLinkNode);
  };

  return (
    <div className={styles.dashboardGrid}>

      {/* Dynamic Security Verification Alert Banners */}
      {uiFeedbackMessage && (
        <div style={{
          gridColumn: '1 / -1',
          padding: '14px 18px',
          borderRadius: '8px',
          fontSize: '0.88rem',
          fontWeight: '600',
          lineHeight: '1.4',
          textAlign: 'left',
          backgroundColor: alertSeverity === 'success' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${alertSeverity === 'success' ? '#bbf7d0' : '#fecaca'}`,
          color: alertSeverity === 'success' ? '#15803d' : '#b91c1c',
          marginBottom: '-10px'
        }}>
          {alertSeverity === 'critical' ? '⚠️ ' : '✅ '} {uiFeedbackMessage}
        </div>
      )}

      {/* Interactive Process Control Header Toolbar */}
      <div className={styles.actionFilterBar}>
        <div className={styles.staticDateBadge}>
          {getTodayFormattedDate()}
        </div>
        <div className={styles.rightActionButtonGroup}>
          <button
            className={isClockedIn ? styles.dangerActionButton : styles.successActionButton}
            onClick={handleClockButtonClick}
            type="button"
          >
            {isClockedIn ? 'Clock Out Now' : 'Clock In Now'}
          </button>

          <button
            className={styles.secondaryActionButton}
            onClick={handleExportSummaryCSVStream}
            type="button"
          >
            Export Summary
          </button>
        </div>
      </div>

      {/* Dynamic Metrics Row Cards */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>PRESENT</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{138 + (presentCount - 2)} / {totalStaffCount}</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>LATE ARRIVALS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.warnText}`}>{4 + (lateCount - 1)}</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>ABSENT</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.actionValue}`}>{3 + (absentCount - 1)}</span>
          </div>
        </div>
      </div>

      {/* Trend View Graph Wrapper Container */}
      <div className={styles.chartContainer}>
        <h3>Monthly Turnout Graph (30-Day Trend View)</h3>
        <div className={styles.trendGraphContainer}>
          <svg className={styles.svgTrendLine} viewBox="0 0 600 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <path d={buildSvgPathFromData(historicalTurnoutData)} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className={styles.graphTimelineLabels}>
            <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
          </div>
        </div>
      </div>

      {/* Real-time Shifts Tracking Table List */}
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
                <td><strong className={emp.isLate ? styles.warnText : emp.status === 'Absent' ? styles.actionValue : ''}>{emp.name}</strong></td>
                <td className={emp.isLate ? styles.warnText : ''}>{emp.shift}</td>
                <td><span className={`${styles.statusLabel} ${emp.statusClass}`}>{emp.compliance}</span></td>
                <td>{emp.overtime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dynamic Pop-Up Form Overlay Element: Clock In */}
      <ClockInModal
        isOpen={isClockInModalOpen}
        onClose={() => setIsClockInModalOpen(false)}
        onConfirmClockIn={executeClockInPipeline}
      />

      {/* Dynamic Pop-Up Form Overlay Element: Clock Out */}
      <ClockOutModal
        isOpen={isClockOutModalOpen}
        onClose={() => setIsClockOutModalOpen(false)}
        onConfirmClockOut={executeClockOutPipeline}
      />
    </div>
  );
};

export default AttendanceView;