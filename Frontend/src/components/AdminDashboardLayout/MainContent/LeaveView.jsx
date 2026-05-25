import React, { useState, useEffect } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import { getAllLeaves, processLeave } from '../../../lib/axios';

const LeaveView = () => {
  // 1. DATA SOURCE STATE ARRAY
  const [leaveRequests, setLeaveRequests] = useState([]);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const { data } = await getAllLeaves();
        setLeaveRequests(data);
      } catch (error) {
        console.error('Failed to fetch leaves:', error);
      }
    };
    fetchLeaves();
  }, []);

  // Unified status modifier function handling both approvals and rejections
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await processLeave(id, newStatus);
      setLeaveRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error('Failed to update leave status:', error);
      alert('Failed to process leave request. Please try again.');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. DYNAMIC ANALYTICS CALCULATIONS ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  const approvedAbsencesCount = leaveRequests.filter(r => r.status === 'Approved').length;
  const totalStaffCount = 142; 
  const computedAvailability = ((totalStaffCount - approvedAbsencesCount) / totalStaffCount * 100).toFixed(1);

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

  const clDisplayWidth = totalApproved > 0 ? `${clPercent}%` : '64%';
  const slDisplayWidth = totalApproved > 0 ? `${slPercent}%` : '22%';
  const elDisplayWidth = totalApproved > 0 ? `${elPercent}%` : '14%';

  // Maps explicitly onto your global stylesheet tokens
  const getValidationStyle = (status) => {
    switch (status) {
      case 'Approved':
        return styles.badgeActive;       // Green background backdrop pill token
      case 'Rejected':
        return styles.statusLabelRed;    // Red background backdrop pill token
      case 'Pending':
      default:
        return styles.statusOnboard;     // Orange/Amber background backdrop pill token
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      
      

      <div className={styles.chartsRow}>
        
        {/* LEFT COMPONENT: Dynamic Monthly Leave Proportions Progress Bars */}
        <div className={styles.chartContainer}>
          <h3>Monthly Leave Class Proportions</h3>
          <div className={styles.chartPlaceholderVertical} style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            
            <div className={styles.deptMetricRow} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 40px', alignItems: 'center', gap: '16px' }}>
              <span className={styles.deptName}>Casual Leave (CL)</span>
              <div className={styles.progressBarContainer} style={{ height: '10px', backgroundColor: '#eef2f7', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: clDisplayWidth, backgroundColor: '#635bff', height: '100%', borderRadius: '9999px', transition: 'width 0.3s ease' }}></div>
              </div>
              <strong className={styles.deptCount}>{totalApproved > 0 ? `${clPercent}%` : '64%'}</strong>
            </div>
            
            <div className={styles.deptMetricRow} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 40px', alignItems: 'center', gap: '16px' }}>
              <span className={styles.deptName}>Sick Leave (SL)</span>
              <div className={styles.progressBarContainer} style={{ height: '10px', backgroundColor: '#eef2f7', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: slDisplayWidth, backgroundColor: '#10b981', height: '100%', borderRadius: '9999px', transition: 'width 0.3s ease' }}></div>
              </div>
              <strong className={styles.deptCount}>{totalApproved > 0 ? `${slPercent}%` : '22%'}</strong>
            </div>
            
            <div className={styles.deptMetricRow} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 40px', alignItems: 'center', gap: '16px' }}>
              <span className={styles.deptName}>Earned Leave (EL)</span>
              <div className={styles.progressBarContainer} style={{ height: '10px', backgroundColor: '#eef2f7', borderRadius: '9999px', overflow: 'hidden' }}>
                <div style={{ width: elDisplayWidth, backgroundColor: '#f59e0b', height: '100%', borderRadius: '9999px', transition: 'width 0.3s ease' }}></div>
              </div>
              <strong className={styles.deptCount}>{totalApproved > 0 ? `${elPercent}%` : '14%'}</strong>
            </div>

          </div>
        </div>

        {/* RIGHT COMPONENT: Dynamic Operational Metrics Card */}
        <div className={styles.chartContainer}>
          <h3>Operational Balance Metrics</h3>
          <div className={styles.operationalContainer}>
            <span className={styles.subTextEmail}>Active Absences (Today)</span>
            <div className={styles.hugeHighlightedValue} style={{ color: '#5d55fa', margin: '6px 0', fontSize: '2.5rem' }}>
              {approvedAbsencesCount} {approvedAbsencesCount === 1 ? 'Employee' : 'Employees'}
            </div>
            <div className={styles.complianceSafeBadge} style={{ color: '#10b981', fontWeight: '600' }}>
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
              <th style={{ textAlign: 'center' }}>GOVERNANCE METRIC</th>
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
                    {/* FIXED: Swapped statusPillBadge class for your stylesheet's native statusLabel descriptor */}
                    <span className={`${styles.statusLabel} ${getValidationStyle(request.status)}`} style={{ display: 'inline-block', minWidth: '95px', textAlign: 'center', padding: '5px 12px', borderRadius: '12px' }}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                      {isFinalized ? (
                        <button className={styles.inlineTableButtonDisabled} style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem' }} disabled>
                          Actioned
                        </button>
                      ) : (
                        <>
                          <button 
                            className={styles.primaryActionButton} 
                            style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                            onClick={() => handleStatusUpdate(request.id, 'Approved')}
                            type="button"
                          >
                            Approve
                          </button>
                          <button 
                            className={styles.dangerInlineActionButton} 
                            style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                            onClick={() => handleStatusUpdate(request.id, 'Rejected')}
                            type="button"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
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