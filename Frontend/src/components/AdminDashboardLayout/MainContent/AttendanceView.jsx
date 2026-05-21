import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import ClockInModal from './ClockInModal';
import ClockOutModal from './ClockOutModal'; // Imported the new checkout popup

const AttendanceView = () => {
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);
  const [isClockOutModalOpen, setIsClockOutModalOpen] = useState(false);
  const [isClockedIn, setIsClockedIn] = useState(false);

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
    if (!isClockedIn) {
      setIsClockInModalOpen(true);
    } else {
      setIsClockOutModalOpen(true); // Replaced standard system window alert with state modal trigger
    }
  };

  const executeClockInPipeline = (formData) => {
    setIsClockedIn(true);
    const activeTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAttendanceRecords(prevList => [
      {
        id: Date.now(),
        name: 'HR Administrator',
        shift: `${activeTimestamp} - Running`,
        compliance: 'Perfect',
        statusClass: styles.statusActive,
        isLate: false,
        overtime: '0.0 hrs',
        status: 'Present'
      },
      ...prevList
    ]);
  };

  // Called when user clicks final confirm button inside Clock Out modal popup
  const executeClockOutPipeline = (handoverNotes) => {
    setIsClockedIn(false);
    const logoutTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update the local list row to replace active running markers with final completed shifts
    setAttendanceRecords(prevList =>
      prevList.map(emp => 
        emp.name === 'HR Administrator' && emp.shift.includes('Running')
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
    phantomLinkNode.setAttribute('download', `Attendance_Report_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    phantomLinkNode.style.visibility = 'hidden';
    document.body.appendChild(phantomLinkNode);
    phantomLinkNode.click();
    document.body.removeChild(phantomLinkNode);
  };

  return (
    <div className={styles.dashboardGrid}>
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