import React, { useState } from 'react';
import styles from '../HRDashboardLayout.module.css';

const TeamMonitoringView = () => {
  // 1. DYNAMIC DATA SOURCES (STATE)
  const [taskCompleted] = useState(142);
  const [avgProductivity] = useState("86.4%");
  const [teamsActive] = useState(7);

  // Modifying these numbers will auto-adjust the progress bars on screen
  const [teamPerformance] = useState([
    { label: 'HR', value: 78 },
    { label: 'Engineering', value: 84 },
    { label: 'Finance', value: 90 },
    { label: 'Operations', value: 82 },
    { label: 'Other', value: 65 },
  ]);

  // Modifying these data points will automatically redraw the SVG line graph curve
  const [weeklyProductivity] = useState([45, 52, 47, 62, 74, 71, 78, 75, 85]);

  // Employee data list state mapping
  const [activityStream] = useState([
    { employee: 'Prince Ghevariya', team: 'Engineering', task: 'Dashboard UI', status: 'Active' },
    { employee: 'Sarah Jenkins', team: 'HR', task: 'Leave Review', status: 'Pending' },
    { employee: 'Michael Ross', team: 'Finance', task: 'Tax Ledger Audit', status: 'Active' },
    { employee: 'Nidhish Zala', team: 'Engineering', task: 'CORS Deployment', status: 'Pending' }
  ]);

  // 2. INTERACTIVE FILTERING STATE CONTROL
  const [filterPendingOnly, setFilterPendingOnly] = useState(false);

  // 3. SVG GRAPH MATH PATH ENGINE GENERATOR
  const buildSvgPathFromData = (dataArray) => {
    const width = 600;
    const height = 100;
    const verticalPadding = 15;
    const usableHeight = height - verticalPadding * 2;

    const points = dataArray.map((val, index) => {
      const x = (index / (dataArray.length - 1)) * width;
      // Invert Y axis calculation since SVG 0 is at the top line
      const y = height - verticalPadding - (val / 100) * usableHeight;
      return { x, y };
    });

    return points.reduce((pathString, point, idx) => {
      return idx === 0 
        ? `M ${point.x.toFixed(1)},${point.y.toFixed(1)}` 
        : `${pathString} L ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    }, '');
  };

  // Conditional status class picker matrix
  const getStatusStyleClass = (status) => {
    return status === 'Active' ? styles.statusActive : styles.statusOnboard;
  };

  // Compute table lines depending on state toggles
  const processedTableData = filterPendingOnly 
    ? activityStream.filter(row => row.status === 'Pending')
    : activityStream;

  return (
    <div className={styles.dashboardGrid}>
      
      {/* ── Top Metric Cards Row ── */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>TASK COMPLETED</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{taskCompleted}</span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3>AVERAGE PRODUCTIVITY</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{avgProductivity}</span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3>TEAMS ACTIVE</h3>
          <div className={styles.metricValueWrapper} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span className={styles.metricValue}>{teamsActive}</span>
            {/* Clickable pill badge to isolate or display all records */}
            <button 
              className={filterPendingOnly ? styles.statusLabel : styles.pillPaidBadge}
              onClick={() => setFilterPendingOnly(!filterPendingOnly)}
              style={{ cursor: 'pointer', border: 'none', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}
              type="button"
            >
              {filterPendingOnly ? 'Show All' : 'Requests'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Graphs Container Blocks Grid ── */}
      <div className={styles.chartsRow}>
        
        {/* Left: Dynamic Team Performance Overview */}
        <div className={styles.chartContainer}>
          <h3>Team Performance Overview</h3>
          <div className={styles.departmentMetricsFlex}>
            {teamPerformance.map((team) => (
              <div key={team.label} className={styles.deptMetricRow}>
                <span className={styles.deptName}>{team.label}</span>
                <div className={styles.progressBarContainer}>
                  {/* Progress bar width bound directly to numerical state value */}
                  <div className={styles.progressBarFill} style={{ width: `${team.value}%` }} />
                </div>
                <strong className={styles.deptCount}>{team.value}%</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Automated Dynamic Line Chart */}
        <div className={styles.chartContainer}>
          <h3>Weekly Productivity</h3>
          <div className={styles.trendGraphContainer}>
            <svg className={styles.svgTrendLine} viewBox="0 0 600 100" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
              <path 
                d={buildSvgPathFromData(weeklyProductivity)} 
                fill="none" 
                stroke="#6366f1" 
                strokeWidth="3" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className={styles.graphTimelineLabels}>
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Active/Pending Requests Log Ledger ── */}
      <div className={styles.activityStream}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '12px' }}>
          {filterPendingOnly ? 'Filtered Action Requests' : 'Recent Leave Requests'}
        </h3>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>TEAM</th>
              <th>CURRENT TASK</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {processedTableData.map((row) => (
              <tr key={row.employee}>
                <td><strong>{row.employee}</strong></td>
                <td>{row.team}</td>
                <td>{row.task}</td>
                <td>
                  {/* Status styles auto-switch background themes conditionally */}
                  <span className={`${styles.statusLabel} ${getStatusStyleClass(row.status)}`} style={{ display: 'inline-block', minWidth: '85px', textAlign: 'center' }}>
                    {row.status}
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

export default TeamMonitoringView;