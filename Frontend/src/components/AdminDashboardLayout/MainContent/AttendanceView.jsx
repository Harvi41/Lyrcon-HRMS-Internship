// AttendanceView.jsx
import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';

const AttendanceView = () => {
  // Core attendance records matrix matching the table row items in the picture
  const [attendanceRecords, setAttendanceRecords] = useState([
    {
      id: 1,
      name: 'Prince Ghevariya',
      checkIn: '09:00 AM',
      checkOut: '06:00 PM',
      mode: 'Hybrid',
      status: 'Present',
      statusClass: styles.badgeActive
    }
  ]);

  // Synchronized coordinates matching the exact trend line slope from your screenshot
  const [historicalTurnoutData] = useState([20, 32, 25, 48, 58, 55, 68, 64, 72, 60, 75]);

  // SVG Line Graph path coordinate generator (Normalized layout scaling)
  const buildSvgPathFromData = (dataArray) => {
    const width = 600;
    const height = 100;
    const paddingY = 10; // Maximizes visual spacing bounds
    const chartHeight = height - paddingY * 2;

    const points = dataArray.map((val, index) => {
      const x = (index / (dataArray.length - 1)) * width;
      // Inverts Y-axis because SVG (0,0) is top-left
      const y = height - paddingY - (val / 100) * chartHeight;
      return { x, y };
    });

    return points.reduce((str, pt, idx) =>
      idx === 0 ? `M ${pt.x.toFixed(1)},${pt.y.toFixed(1)}` : `${str} L ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`,
      ''
    );
  };

  return (
    <div className={styles.dashboardGrid}>



      {/* Synchronized Metrics Summary Cards */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>MONTHLY AVG PRESENT RATE</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>94.8%</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>AVG CLOCK-IN TIME</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>09:04 AM</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>Late Check-In</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>12</span>
          </div>
        </div>
      </div>

      {/* Trend Line Plot Visualizer Component */}
      <div className={styles.chartContainer}>
        <h3>Attendance Overview (30-Day Trend View)</h3>
        <div className={styles.trendGraphContainer} style={{ width: '100%', marginTop: '16px' }}>

          <svg
            className={styles.svgTrendLine}
            viewBox="0 0 600 100"
            preserveAspectRatio="none"
            style={{ width: '100%', height: '140px', overflow: 'visible', display: 'block' }}
          >
            {/* Base Guideline underneath the plot path */}
            <line x1="0" y1="98" x2="600" y2="98" stroke="#e2e8f0" strokeWidth="1" />

            {/* Clean dynamic trend path vector curve matching image color profiling */}
            <path
              d={buildSvgPathFromData(historicalTurnoutData)}
              fill="none"
              stroke="#635bff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* FIXED: Balanced timeline labels leveraging explicit grid spacing tracking matrix */}
          <div
            className={styles.graphTimelineLabels}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              width: '100%',
              marginTop: '16px',
              fontSize: '0.85rem',
              color: '#94a3b8',
              fontWeight: '500'
            }}
          >
            <span style={{ textAlign: 'left', paddingLeft: '2px' }}>Week 1</span>
            <span style={{ textAlign: 'center', marginLeft: '-20px' }}>Week 2</span>
            <span style={{ textAlign: 'center', marginLeft: '40px' }}>Week 3</span>
            <span style={{ textAlign: 'right', paddingRight: '2px' }}>Week 4</span>
          </div>

        </div>
      </div>

      {/* Real-time Tracking Activity Log System */}
      <div className={styles.activityStream}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>CHECK-IN</th>
              <th>CHECK-OUT</th>
              <th>MODE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((emp) => (
              <tr key={emp.id}>
                <td><strong className={styles.employeeNameLink}>{emp.name}</strong></td>
                <td>{emp.checkIn}</td>
                <td>{emp.checkOut}</td>
                <td>{emp.mode}</td>
                <td>
                  <span className={`${styles.statusLabel} ${emp.statusClass || styles.badgeActive}`} style={{ display: 'inline-block', minWidth: '95px', textAlign: 'center', padding: '5px 12px', borderRadius: '12px' }}>
                    {emp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default AttendanceView;