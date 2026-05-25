// AnnouncementsView.jsx
import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';

const AnnouncementsView = () => {
  // 1. STATE-DRIVEN METRIC PARAMETERS
  const [totalAnnouncements] = useState(12);
  const [upcomingEvents] = useState(3);

  // 2. DATA SOURCE STATE ARRAY - Synchronized with the single active row in your screenshot
  const [announcements] = useState([
    { 
      title: 'Office Maintenance', 
      category: 'IT Notice', 
      description: 'Server maintenance', 
      date: 'May 24, 2026', 
      priority: 'high' 
    }
  ]);

  // Helper mapping matrix assigning class indicators natively from your module sheet
  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return styles.statusLabelRed; // Maps to soft crimson badge
      case 'medium':
      default:
        return styles.statusOnboard;  // Maps to soft orange/amber badge
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      
      {/* Top Metrics Row Panels - Configured to display 2 balanced blocks */}
      <div className={styles.metricsRow} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className={styles.metricCard}>
          <h3>TOTAL ANNOUNCEMENTS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>{totalAnnouncements}</span>
          </div>
        </div>
        
        <div className={styles.metricCard}>
          <h3>UPCOMING EVENTS</h3>
          <div className={styles.metricValueWrapper}>
            {/* Color style override applied directly to match the screenshot's orange tone */}
            <span className={styles.metricValue} style={{ color: '#f97316' }}>
              {upcomingEvents}
            </span>
          </div>
        </div>
      </div>

      {/* Main Core Announcements Table Container */}
      <div className={styles.activityStream}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>TITLE</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>CATEGORY</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>DESCRIPTION</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>DATE</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600', paddingRight: '24px' }}>PRIORITY</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((item) => (
              <tr key={item.title}>
                <td><strong style={{ color: '#0f172a', fontWeight: '700' }}>{item.title}</strong></td>
                <td style={{ color: '#475569', fontWeight: '500' }}>{item.category}</td>
                <td style={{ color: '#0f172a', fontWeight: '500' }}>{item.description}</td>
                {/* Custom inline coloring for the row timeline values */}
                <td style={{ color: '#16a34a', fontWeight: '600' }}>{item.date}</td>
                <td>
                  <span 
                    className={`${styles.statusLabel} ${getPriorityClass(item.priority)}`}
                    style={{ 
                      display: 'inline-block', 
                      minWidth: '85px', 
                      textAlign: 'center',
                      padding: '5px 12px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '0.8rem'
                    }}
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