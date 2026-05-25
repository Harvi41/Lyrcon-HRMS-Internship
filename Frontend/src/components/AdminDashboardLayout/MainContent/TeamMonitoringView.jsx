// TeamMonitoringView.jsx
import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';

const TeamMonitoringView = () => {
  // 1. DYNAMIC DATA SOURCES (STATE)
  const [taskCompleted] = useState(142);
  const [avgProductivity] = useState("86.4%");
  const [teamsActive] = useState(7);

  // Mapped heights matching the bar distribution ratio in your screenshot
  const [teamPerformance] = useState([
    { label: 'HR', value: 65 },
    { label: 'Engineering', value: 76 },
    { label: 'Finance', value: 85 },
    { label: 'Operations', value: 73 },
    { label: 'Other', value: 55 },
  ]);

  // Synchronized coordinate sequence mimicking your screenshot curve perfectly
  const [weeklyProductivity] = useState([15, 30, 22, 48, 55, 62, 58, 68, 70, 60, 75]);

  // Table row content tracking active states
  const [activityStream] = useState([
    { employee: 'Prince Ghevariya', team: 'Engineering', task: 'Dashboard UI', status: 'Active' }
  ]);

  // 2. SVG GRAPH MATH PATH ENGINE GENERATOR
  const buildSvgPathFromData = (dataArray) => {
    const width = 600;
    const height = 100;
    const verticalPadding = 12;
    const usableHeight = height - verticalPadding * 2;

    const points = dataArray.map((val, index) => {
      const x = (index / (dataArray.length - 1)) * width;
      const y = height - verticalPadding - (val / 100) * usableHeight;
      return { x, y };
    });

    return points.reduce((pathString, point, idx) => {
      return idx === 0 
        ? `M ${point.x.toFixed(1)},${point.y.toFixed(1)}` 
        : `${pathString} L ${point.x.toFixed(1)},${point.y.toFixed(1)}`;
    }, '');
  };

  const getStatusStyleClass = (status) => {
    return status === 'Active' ? styles.badgeActive : styles.statusOnboard;
  };

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
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue} style={{ color: '#f97316' }}>{teamsActive}</span>
          </div>
        </div>
      </div>

      {/* ── Graphs Container Blocks Grid ── */}
      <div className={styles.chartsRow}>
        
        {/* Left: Dynamic Team Performance Overview */}
        <div className={styles.chartContainer}>
          <h3>Team Performance Overview</h3>
          <div 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-end', 
              height: '160px', 
              padding: '20px 10px 10px 10px',
              position: 'relative'
            }}
          >
            {/* Background horizontal subtle grid baseline indicator */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: '34px', borderBottom: '1px solid #f1f5f9', zIndex: 1 }}></div>

            {teamPerformance.map((team) => {
              const isOtherBar = team.label === 'Other';
              return (
                <div 
                  key={team.label} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    flex: 1, 
                    height: '100%', 
                    justifyContent: 'flex-end',
                    zIndex: 2
                  }}
                >
                  <div 
                    style={{ 
                      width: '32px', 
                      height: `${team.value}%`, 
                      background: isOtherBar ? '#3b82f6' : '#5d55fa', 
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.5s ease'
                    }}
                  />
                  <span 
                    style={{ 
                      marginTop: '12px', 
                      fontSize: '0.8rem', 
                      color: '#64748b', 
                      fontWeight: '500' 
                    }}
                  >
                    {team.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Automated Dynamic Line Chart with Grid Alignment System */}
        <div className={styles.chartContainer}>
          <h3>Weekly Productivity</h3>
          <div className={styles.trendGraphContainer} style={{ width: '100%', marginTop: '10px' }}>
            <svg 
              className={styles.svgTrendLine} 
              viewBox="0 0 600 100" 
              preserveAspectRatio="none" 
              style={{ width: '100%', height: '120px', overflow: 'visible', display: 'block' }}
            >
              <line x1="0" y1="98" x2="600" y2="98" stroke="#e2e8f0" strokeWidth="1" />
              <path 
                d={buildSvgPathFromData(weeklyProductivity)} 
                fill="none" 
                stroke="#635bff" 
                strokeWidth="2.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            
            {/* Split Column Balanced Matrix for Chart Timelines */}
            <div 
              style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                width: '100%', 
                marginTop: '16px',
                fontSize: '0.8rem',
                color: '#94a3b8',
                fontWeight: '500'
              }}
            >
              <span style={{ textAlign: 'left', paddingLeft: '8px' }}>Week 1</span>
              <span style={{ textAlign: 'center' }}>Week 2</span>
              <span style={{ textAlign: 'right', paddingRight: '8px' }}>Week 3</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Active Requests Log Ledger ── */}
      <div className={styles.activityStream} style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '16px', color: '#1e293b' }}>
          Recent Leave Requests
        </h3>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>Employee</th>
              <th style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>Team</th>
              <th style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>Current Task</th>
              <th style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {activityStream.map((row) => (
              <tr key={row.employee}>
                <td><strong style={{ color: '#4f46e5', fontWeight: '600' }}>{row.employee}</strong></td>
                <td><strong>{row.team}</strong></td>
                <td style={{ color: '#475569' }}>{row.task}</td>
                <td>
                  <span 
                    className={`${styles.statusLabel} ${getStatusStyleClass(row.status)}`} 
                    style={{ 
                      display: 'inline-block', 
                      minWidth: '90px', 
                      textAlign: 'center',
                      padding: '5px 12px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '0.8rem'
                    }}
                  >
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