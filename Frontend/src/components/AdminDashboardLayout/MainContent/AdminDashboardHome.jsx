import React from 'react';
import styles from '../AdminDashboardLayout.module.css';

const AdminDashboardHome = () => {
  // Chart data exactly matching the 5 days (Mon-Fri) from the image
  const chartBars = [
    { label: 'Mon', height: '65%', isAccent: false },
    { label: 'Tue', height: '75%', isAccent: false },
    { label: 'Wed', height: '82%', isAccent: false },
    { label: 'Thu', height: '72%', isAccent: false },
    { label: 'Fri', height: '58%', isAccent: true } // Distinct light blue bar
  ];

  // Leave overview progress metrics matching the image exactly
  const departments = [
    { name: 'Engineering', count: 74, width: '74%', color: '#5d55fa' },
    { name: 'Finance', count: 32, width: '45%', color: '#3b82f6' },
    { name: 'HR Team', count: 18, width: '25%', color: '#10b981' }
  ];

  return (
    <div className={styles.dashboardGrid}>
      {/* Metrics Summary Row */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>PRESENT EMPLOYEES</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>142</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>TODAY'S ATTENDANCE RATE</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>96.4%</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>PENDING LEAVE</h3>
          <div className={styles.metricValueWrapper}>
            {/* Orange text applied directly to value as per image */}
            <span className={`${styles.metricValue} ${styles.actionValue}`}>7 Requests</span>
          </div>
        </div>
      </div>

      {/* Analytics Visualization Grid */}
      <div className={styles.chartsRow}>
        {/* Weekly Attendance Report Card */}
        <div className={styles.chartContainer}>
          <h3>Weekly Attendance Report</h3>
          <div className={styles.chartPlaceholder}>
            <div className={styles.barGroupWrapper}>
              {chartBars.map((bar, index) => (
                <div key={index} className={styles.barColumn}>
                  <div 
                    className={`${styles.chartBarElement} ${bar.isAccent ? styles.barAccentColor : styles.barDefaultColor}`} 
                    style={{ height: bar.height }}
                  />
                  <span className={styles.chartBarLabel}>{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Employee Leave Overview Progress Card */}
        <div className={styles.chartContainer}>
          <h3>Employee Leave Overview</h3>
          <div className={styles.departmentMetricsFlex}>
            {departments.map((dept, index) => (
              <div key={index} className={styles.deptMetricRow}>
                <span className={styles.deptName}>{dept.name}</span>
                <div className={styles.progressBarContainer}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: dept.width, backgroundColor: dept.color }}
                  />
                </div>
                <strong className={styles.deptCount}>{dept.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Leave Requests Table Grid */}
      <div className={styles.activityStream}>
        <h3>Recent Leave Requests</h3>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>LEAVE TYPE</th>
              <th>DATE</th>
              <th>STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className={styles.employeeNameLink}>Prince Ghevariya</span></td>
              <td><strong>Casual Leave</strong></td>
              <td>May 22</td>
              <td>
                <span className={styles.statusCommitted}>Approved</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboardHome;