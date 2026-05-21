import React, { useState } from 'react';
import styles from '../HRDashboardLayout.module.css';

const LeaveView = () => {
  // CRUD / State Array management for leave records
  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: 1,
      employee: 'Sarah Jenkins',
      classification: 'Sick Leave (SL)',
      chronoRange: 'Oct 24 - Oct 25',
      status: 'Pending'
    },
    {
      id: 2,
      employee: 'Michael Ross',
      classification: 'Casual Leave (CL)',
      chronoRange: 'Nov 02 - Nov 03',
      status: 'Approved' // Example of an already approved, non-clickable row
    }
  ]);

  // Handle Approve Action Operation
  const handleApprove = (id) => {
    setLeaveRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: 'Approved' } : request
      )
    );
  };

  return (
    <div className={styles.dashboardGrid}>
      <div className={styles.chartsRow}>
        <div className={styles.chartContainer}>
          <h3>Monthly Leave Class Proportions</h3>
          <div className={styles.chartPlaceholderVertical}>
            <div className={styles.deptMetric}>
              <span>Casual Leave (CL)</span>
              <div className={styles.progressBar}><div style={{ width: '64%' }}></div></div>
              <strong>64%</strong>
            </div>
            <div className={styles.deptMetric}>
              <span>Sick Leave (SL)</span>
              <div className={styles.progressBar}><div style={{ width: '22%', backgroundColor: '#10b981' }}></div></div>
              <strong>22%</strong>
            </div>
            <div className={styles.deptMetric}>
              <span>Earned Leave (EL)</span>
              <div className={styles.progressBar}><div style={{ width: '14%', backgroundColor: '#f59e0b' }}></div></div>
              <strong>14%</strong>
            </div>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <h3>Operational Balance Metrics</h3>
          <div className={styles.operationalContainer}>
            <span className={styles.subTextEmail}>Active Absences (Today)</span>
            <div className={styles.hugeHighlightedValue}>4 Employees</div>
            <div className={styles.complianceSafeBadge}>✓ Staffing limits within safe thresholds (96.4% available)</div>
          </div>
        </div>
      </div>

      {/* Balance Request Table Grid validations */}
      <div className={styles.activityStream}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>CLASSIFICATION</th>
              <th>CHRONO RANGE</th>
              <th>STATUS VALIDATION</th>
              <th>GOVERNANCE METRIC</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => {
              const isApproved = request.status === 'Approved';
              
              return (
                <tr key={request.id}>
                  <td><strong>{request.employee}</strong></td>
                  <td>{request.classification}</td>
                  <td>{request.chronoRange}</td>
                  <td>
                    {/* Status badge changes color dynamically based on state */}
                    <span className={`${styles.statusLabel} ${isApproved ? styles.statusActive : styles.statusOnboard}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    {/* Button becomes disabled, visually altered, and non-clickable if Approved */}
                    <button 
                      className={isApproved ? styles.inlineTableButtonDisabled : styles.inlineTableButton}
                      onClick={() => handleApprove(request.id)}
                      disabled={isApproved}
                    >
                      {isApproved ? 'Approved' : 'Approve'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveView;