import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';

const AnnouncementsView = () => {
  // 1. STATE-DRIVEN METRIC PARAMETERS
  const [totalAnnouncements] = useState(12);
  const [upcomingEvents] = useState(3);
  const [publishedToday] = useState(4);

  // 2. DATA SOURCE STATE ARRAY
  const [announcements, setAnnouncements] = useState([
    { title: 'Office Maintenance', category: 'IT Notice', description: 'Server maintenance', date: 'May 24, 2026', priority: 'High' },
    { title: 'Policy Update', category: 'HR Notice', description: 'Leave policy refresh', date: 'May 25, 2026', priority: 'Medium' },
  ]);

  // Helper mapping matrix to assign the priority tag styles dynamically
  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'High':
        return styles.statusLabelRed || styles.statusOnboard; // Uses custom red if added, falls back to orange
      case 'Medium':
      default:
        return styles.statusOnboard; // Standard orange notification style
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      {/* Top Metrics Row Panels */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>TOTAL ANNOUNCEMENTS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{totalAnnouncements}</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>UPCOMING EVENTS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.timeLink}`}>{upcomingEvents}</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>PUBLISHED TODAY</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{publishedToday}</span>
          </div>
        </div>
      </div>

      {/* Main Core Announcements Table */}
      <div className={styles.activityStream}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>TITLE</th>
              <th>CATEGORY</th>
              <th>DESCRIPTION</th>
              <th>DATE</th>
              <th style={{ textAlign: 'center' }}>PRIORITY</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((item) => (
              <tr key={item.title}>
                <td><strong>{item.title}</strong></td>
                <td style={{ color: '#64748b' }}>{item.category}</td>
                <td>{item.description}</td>
                <td style={{ color: '#475569' }}>{item.date}</td>
                <td style={{ textAlign: 'center' }}>
                  {/* Class assignment shifts automatically based on item priority state values */}
                  <span 
                    className={`${styles.statusLabel} ${getPriorityClass(item.priority)}`}
                    style={{ display: 'inline-block', minWidth: '80px', textAlign: 'center' }}
                  >
                    {item.priority}
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

export default AnnouncementsView;