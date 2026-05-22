// AdminDashboardHome.jsx
import React from 'react';
import styles from '../AdminDashboardLayout.module.css';

const AdminDashboardHome = () => {
  // 1. Chart metrics data matching your 5 days (Mon-Fri) from the image
  const concurrencyBars = [
    { label: 'Mon', height: '52%' },
    { label: 'Tue', height: '60%' },
    { label: 'Wed', height: '65%' },
    { label: 'Thu', height: '58%' },
    { label: 'Fri', height: '48%' } 
  ];

  // 2. Department distribution values mapping directly to the right panel lengths
  const departments = [
    { name: 'Engineering', count: 74, width: '75%', color: '#4f46e5' },
    { name: 'Operations', count: 32, width: '42%', color: '#3b82f6' },
    { name: 'HR Team', count: 18, width: '22%', color: '#10b981' }
  ];

  return (
    <div className={styles.dashboardGrid}>
      
      {/* ── Top Welcome Greeting Header ── */}
      <div style={{ padding: '4px 0 10px 0' }}>
        <h1 style={{ fontSize: '1.65rem', fontWeight: '700', color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
          Welcome Back, Prince
        </h1>
        <p style={{ margin: '4px 0 0 0', fontSize: '0.88rem', color: '#64748b', fontWeight: '500' }}>
          Here is what's happening across your workplace container dashboard console today.
        </p>
      </div>

      {/* ── Top Metrics Summary Cards Row ── */}
      <div className={styles.metricsRow}>
        {/* Card 1: Global Headcount */}
        <div className={styles.metricCard}>
          <h3>GLOBAL HEADCOUNT</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>0</span>
            <span className={styles.statusPillBadge} style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.72rem', padding: '2px 10px', borderRadius: '12px', fontWeight: '700' }}>
              Live
            </span>
          </div>
        </div>
        
        {/* Card 2: Active Workforce Rate */}
        <div className={styles.metricCard}>
          <h3>ACTIVE WORKFORCE RATE</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>0%</span>
            <span className={styles.statusPillBadge} style={{ background: '#d1fae5', color: '#065f46', fontSize: '0.72rem', padding: '2px 10px', borderRadius: '12px', fontWeight: '700' }}>
              Live
            </span>
          </div>
        </div>
        
        {/* Card 3: Pending Actions */}
        <div className={styles.metricCard}>
          <h3>PENDING ACTIONS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>0 Issues</span>
            <span className={styles.statusPillBadge} style={{ background: '#ffedd5', color: '#b45309', fontSize: '0.72rem', padding: '2px 10px', borderRadius: '12px', fontWeight: '700' }}>
              0 damaged
            </span>
          </div>
        </div>
      </div>

      {/* ── Analytics Data Visualization Grid Columns ── */}
      <div className={styles.chartsRow}>
        
        {/* LEFT COMPONENT: Weekly Clock-In Concurrency */}
        <div className={styles.chartContainer}>
          <h3>Weekly Clock-In Concurrency</h3>
          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '10px 14px 0 14px', width: '100%', boxSizing: 'border-box' }}>
            {concurrencyBars.map((bar, index) => {
              const isFriday = bar.label === 'Fri';
              return (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' }}>
                  <div 
                    style={{ 
                      height: bar.height, 
                      width: '36px',
                      backgroundColor: isFriday ? '#3b82f6' : '#5d55fa',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease'
                    }} 
                  />
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', marginTop: '12px' }}>
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COMPONENT: Department Distribution Metrics */}
        <div className={styles.chartContainer}>
          <h3>Department Distribution Metrics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%', justifyContent: 'center', height: '100%', padding: '10px 0' }}>
            {departments.map((dept, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '16px' }}>
                <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '600', width: '110px', minWidth: '110px' }}>
                  {dept.name}
                </span>
                
                {/* Horizontal Progress Track Fill layer */}
                <div style={{ flex: 1, height: '12px', backgroundColor: '#f1f5f9', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: dept.width, 
                      backgroundColor: dept.color, 
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease'
                    }} 
                  />
                </div>
                
                <strong style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: '700', width: '30px', textAlign: 'right' }}>
                  {dept.count}
                </strong>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── System Activity Stream Logs Ledger Data Table ── */}
      <div className={styles.activityStream}>
        <h3>System Activity Stream</h3>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>TIMESTAMP</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>ACTOR</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>EVENT CATEGORY</th>
              <th style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>STATUS OVERVIEW</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ color: '#16a34a', fontWeight: '600', fontSize: '0.88rem' }}>Now</td>
              <td style={{ color: '#334155', fontWeight: '500' }}>Prince Ghevariya</td>
              <td style={{ color: '#334155', fontWeight: '500' }}>Engineering</td>
              <td>
                <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '0.85rem' }}>
                  active
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
    </div>
  );
};

export default AdminDashboardHome;