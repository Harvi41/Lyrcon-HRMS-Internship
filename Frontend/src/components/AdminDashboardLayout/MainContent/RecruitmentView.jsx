import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';

const RecruitmentView = () => {
  // 1. STATE-DRIVEN RECRUITMENT PIPELINE PARAMETERS
  const [roles] = useState([
    { label: 'Applications', value: 12, width: '100%' }, // 12 / 12 = 100% full scale width base boundary
    { label: 'Shortlisted', value: 8, width: '66.6%' },  // 8 / 12 = 66.6% width ratio balance
    { label: 'Interviews', value: 4, width: '33.3%' },   // 4 / 12 = 33.3% width ratio balance
  ]);

  // 2. APPLICANTS LEDGER ROUTING CONTEXT STATE
  const [applicants] = useState([
    { name: 'Nidhi Patel', role: 'HR Coordinator', status: 'Reviewed' },
    { name: 'Aman Shah', role: 'Frontend Intern', status: 'Pending' },
    { name: 'Sarah Jenkins', role: 'Payroll Analyst', status: 'Shortlisted' },
  ]);

  // Helper dynamic selection matrix mapping badge class tokens accurately
  const getCandidateBadgeStyle = (status) => {
    switch (status) {
      case 'Reviewed':
      case 'Shortlisted':
        return styles.statusActive;    // Green text and backdrop
      case 'Pending':
      default:
        return styles.statusOnboard;   // Orange text and backdrop
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      {/* Top Metrics Row Panels */}
      <div className={styles.metricsRow}>
        <div className={styles.metricCard}>
          <h3>OPEN REQUISITIONS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>12</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>SHORTLIST RATE</h3>
          <div className={styles.metricValueWrapper}>
            <span className={styles.metricValue}>80%</span>
          </div>
        </div>
        <div className={styles.metricCard}>
          <h3>ACTIVE INTERVIEWS</h3>
          <div className={styles.metricValueWrapper}>
            <span className={`${styles.metricValue} ${styles.timeLink}`}>24</span>
          </div>
        </div>
      </div>

      {/* Main Graph & Table Flex Row Split Containers */}
      <div className={styles.chartsRow}>
        
        {/* LEFT COMPONENT: Pipeline Distribution Graph Bar Blocks */}
        <div className={styles.chartContainer}>
          <h3>Recruitment Pipeline</h3>
          <div className={styles.departmentMetricsFlex} style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
            {roles.map((item) => (
              <div key={item.label} className={styles.deptMetricRow} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className={styles.deptName} style={{ minWidth: '95px', textAlign: 'left' }}>{item.label}</span>
                <div className={styles.progressBarContainer} style={{ flex: 1, margin: '0 16px', height: '10px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                  <div 
                    className={styles.progressBarFill} 
                    style={{ width: item.width, backgroundColor: '#6366f1', height: '100%', borderRadius: '999px', transition: 'width 0.4s ease' }} 
                  />
                </div>
                <strong className={styles.deptCount} style={{ minWidth: '20px', textAlign: 'right' }}>{item.value}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COMPONENT: Candidate Status Ledger Overview */}
        <div className={styles.chartContainer}>
          <h3>Candidate Status Overview</h3>
          <table className={styles.activityTable}>
            <thead>
              <tr>
                <th>CANDIDATE</th>
                <th>ROLE</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((candidate) => (
                <tr key={candidate.name}>
                  <td><strong>{candidate.name}</strong></td>
                  <td style={{ color: '#475569' }}>{candidate.role}</td>
                  <td style={{ textAlign: 'center' }}>
                    {/* Evaluates status string properties to assign target CSS color badges dynamically */}
                    <span className={`${styles.statusLabel} ${getCandidateBadgeStyle(candidate.status)}`} style={{ display: 'inline-block', minWidth: '85px', textAlign: 'center' }}>
                      {candidate.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default RecruitmentView;