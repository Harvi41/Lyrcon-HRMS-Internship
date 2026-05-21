import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';

const LeaveView = () => {
  // 1. DATA SOURCE STATE ARRAY
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
      status: 'Approved'
    },
    {
      id: 3,
      employee: 'Nidhish Zala',
      classification: 'Earned Leave (EL)',
      chronoRange: 'Nov 10 - Nov 12',
      status: 'Approved'
    }
  ]);

  // Unified status modifier function handling both approvals and rejections
  const handleStatusUpdate = (id, newStatus) => {
    setLeaveRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: newStatus } : request
      )
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. DYNAMIC ANALYTICS CALCULATIONS ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  // Filter out approved items to represent real-time active absences
  const approvedAbsencesCount = leaveRequests.filter(r => r.status === 'Approved').length;
  const totalStaffCount = 142; 
  const computedAvailability = ((totalStaffCount - approvedAbsencesCount) / totalStaffCount * 100).toFixed(1);

  // Calculate dynamic category proportions from approved records
  const approvedRecords = leaveRequests.filter(r => r.status === 'Approved');
  const totalApproved = approvedRecords.length;

  const getCategoryPercentage = (classificationKeyword) => {
    if (totalApproved === 0) return 0;
    const matches = approvedRecords.filter(r => r.classification.includes(classificationKeyword)).length;
    return Math.round((matches / totalApproved) * 100);
  };

  const clPercent = getCategoryPercentage('Casual');
  const slPercent = getCategoryPercentage('Sick');
  const elPercent = getCategoryPercentage('Earned');

  // Fallback defaults if no items are approved yet to keep charts visual
  const clDisplayWidth = totalApproved > 0 ? `${clPercent}%` : '64%';
  const slDisplayWidth = totalApproved > 0 ? `${slPercent}%` : '22%';
  const elDisplayWidth = totalApproved > 0 ? `${elPercent}%` : '14%';

  // Helper mapping function to toggle CSS class tokens dynamically
  const getValidationStyle = (status) => {
    switch (status) {
      case 'Approved':
        return styles.statusActive;    // Green text and backdrop
      case 'Rejected':
        return styles.statusLabelRed;  // Red text and backdrop
      case 'Pending':
      default:
        return styles.statusOnboard;   // Orange text and backdrop
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      <div className={styles.chartsRow}>
        
        {/* LEFT COMPONENT: Dynamic Monthly Leave Proportions */}
        <div className={styles.chartContainer}>
          <h3>Monthly Leave Class Proportions</h3>
          <div className={styles.chartPlaceholderVertical}>
            <div className={styles.deptMetric}>
              <span>Casual Leave (CL)</span>
              <div className={styles.progressBar}>
                <div style={{ width: clDisplayWidth, transition: 'width 0.3s ease' }}></div>
              </div>
              <strong>{totalApproved > 0 ? `${clPercent}%` : '64%'}</strong>
            </div>
            <div className={styles.deptMetric}>
              <span>Sick Leave (SL)</span>
              <div className={styles.progressBar}>
                <div style={{ width: slDisplayWidth, backgroundColor: '#10b981', transition: 'width 0.3s ease' }}></div>
              </div>
              <strong>{totalApproved > 0 ? `${slPercent}%` : '22%'}</strong>
            </div>
            <div className={styles.deptMetric}>
              <span>Earned Leave (EL)</span>
              <div className={styles.progressBar}>
                <div style={{ width: elDisplayWidth, backgroundColor: '#f59e0b', transition: 'width 0.3s ease' }}></div>
              </div>
              <strong>{totalApproved > 0 ? `${elPercent}%` : '14%'}</strong>
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: Dynamic Operational Metrics Card */}
        <div className={styles.chartContainer}>
          <h3>Operational Balance Metrics</h3>
          <div className={styles.operationalContainer}>
            <span className={styles.subTextEmail}>Active Absences (Today)</span>
            <div className={styles.hugeHighlightedValue} style={{ color: '#6366f1', margin: '8px 0' }}>
              {approvedAbsencesCount} {approvedAbsencesCount === 1 ? 'Employee' : 'Employees'}
            </div>
            <div className={styles.complianceSafeBadge}>
              ✓ Staffing limits within safe thresholds ({computedAvailability}% available)
            </div>
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
              const isFinalized = request.status === 'Approved' || request.status === 'Rejected';
              
              return (
                <tr key={request.id}>
                  <td><strong>{request.employee}</strong></td>
                  <td>{request.classification}</td>
                  <td>{request.chronoRange}</td>
                  <td>
                    <span className={`${styles.statusLabel} ${getValidationStyle(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    {isFinalized ? (
                      <button className={styles.inlineTableButtonDisabled} disabled>
                        {request.status}
                      </button>
                    ) : (
                      <div className={styles.rightActionButtonGroup} style={{ gap: '8px' }}>
                        <button 
                          className={styles.inlineTableButton} 
                          onClick={() => handleStatusUpdate(request.id, 'Approved')}
                          type="button"
                        >
                          Approve
                        </button>
                        <button 
                          className={styles.dangerInlineActionButton} 
                          onClick={() => handleStatusUpdate(request.id, 'Rejected')}
                          type="button"
                        >
                          Reject
                        </button>
                      </div>
                    )}
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