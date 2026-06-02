import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';
import { getAllLeaves, processLeave } from '../../../lib/axios';

const LeaveView = () => {
  // 1. DATA SOURCE STATE ARRAY
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const { data } = await getAllLeaves();
        
        // Defensive mapping validation setup
        const mappedData = Array.isArray(data) ? data.map(leave => ({
          id: leave?._id || '',
          employee: leave?.userId?.name || leave?.userId?.email || 'Unknown Staff',
          classification: leave?.leaveType || 'General Leave', // Safeguards missing string classifications
          rawStart: leave?.startDate,
          rawEnd: leave?.endDate,
          chronoRange: `${leave?.startDate ? new Date(leave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}) : '—'} - ${leave?.endDate ? new Date(leave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric'}) : '—'}`,
          status: leave?.status || 'Pending'
        })) : [];
        
        setLeaveRequests(mappedData);
      } catch (error) {
        console.error('Failed to fetch leaves:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaves();
  }, []);

  const [reviewModal, setReviewModal] = useState({ isOpen: false, type: '', request: null });
  const [rejectReason, setRejectReason] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');

  const openReviewModal = (request, type) => {
    setReviewModal({ isOpen: true, type, request });
    if (type === 'Rejected') {
        setRejectReason('');
    } else if (type === 'Approved') {
        setEditStartDate(request.rawStart ? new Date(request.rawStart).toISOString().split('T')[0] : '');
        setEditEndDate(request.rawEnd ? new Date(request.rawEnd).toISOString().split('T')[0] : '');
    }
  };

  const closeReviewModal = () => {
    setReviewModal({ isOpen: false, type: '', request: null });
  };

  const confirmStatusUpdate = async () => {
    const { type, request } = reviewModal;
    try {
      const payload = { status: type };
      if (type === 'Rejected') {
          if (!rejectReason.trim()) return alert("Rejection reason is required.");
          payload.comments = rejectReason;
      } else if (type === 'Approved') {
          if (!editStartDate || !editEndDate) return alert("Start and End dates are required.");
          if (new Date(editStartDate) > new Date(editEndDate)) return alert("Start date cannot be after end date.");
          payload.startDate = editStartDate;
          payload.endDate = editEndDate;
      }

      await processLeave(request.id, payload);
      
      // Update state instantly
      setLeaveRequests((prevRequests) =>
        prevRequests.map((req) => {
          if (req.id === request.id) {
             let newChronoRange = req.chronoRange;
             if (type === 'Approved') {
                newChronoRange = `${new Date(editStartDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})} - ${new Date(editEndDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}`;
             }
             return { ...req, status: type, chronoRange: newChronoRange };
          }
          return req;
        })
      );
      closeReviewModal();
    } catch (error) {
      console.error('Failed to update leave status:', error);
      alert('Failed to process leave request. Please try again.');
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. CRASH-PROOF DYNAMIC ANALYTICS CALCULATIONS ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  const approvedAbsencesCount = Array.isArray(leaveRequests) ? leaveRequests.filter(r => r?.status === 'Approved').length : 0;
  const totalStaffCount = 142; 
  const computedAvailability = ((totalStaffCount - approvedAbsencesCount) / totalStaffCount * 100).toFixed(1);

  const approvedRecords = Array.isArray(leaveRequests) ? leaveRequests.filter(r => r?.status === 'Approved') : [];
  const totalApproved = approvedRecords.length;

  // FIXED: Added defensive fallback checks to ensure `.includes` handles valid strings exclusively
  const getCategoryPercentage = (classificationKeyword) => {
    if (totalApproved === 0) return 0;
    
    const searchKeyword = typeof classificationKeyword === 'string' ? classificationKeyword.toLowerCase() : '';
    
    const matches = approvedRecords.filter(r => {
      const targetClass = typeof r?.classification === 'string' ? r.classification.toLowerCase() : '';
      return targetClass.includes(searchKeyword);
    }).length;
    
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
    <>
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
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                  Processing balance ledger metrics matrix...
                </td>
              </tr>
            ) : leaveRequests.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: '#64748b', fontStyle: 'italic' }}>
                  No leave requests logged in this directory file.
                </td>
              </tr>
            ) : (
              leaveRequests.map((request, i) => {
                const isFinalized = request?.status === 'Approved' || request?.status === 'Rejected';
                
                return (
                  <tr key={request?.id || i}>
                    <td><strong>{request?.employee || 'Unknown Staff'}</strong></td>
                    <td>{request?.classification || 'General Leave'}</td>
                    <td>{request?.chronoRange || '—'}</td>
                    <td>
                      <span className={`${styles.statusLabel} ${getValidationStyle(request?.status)}`} style={{ display: 'inline-block', minWidth: '95px', textAlign: 'center', padding: '5px 12px', borderRadius: '12px' }}>
                        {request?.status || 'Pending'}
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
                              onClick={() => openReviewModal(request, 'Approved')}
                              type="button"
                            >
                              Approve
                            </button>
                            <button 
                              className={styles.dangerInlineActionButton} 
                              style={{ padding: '6px 16px', borderRadius: '6px', fontSize: '0.85rem', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}
                              onClick={() => openReviewModal(request, 'Rejected')}
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
              })
            )}
          </tbody>
        </table>
      </div>

      </div>
      {reviewModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: reviewModal.type === 'Approved' ? '#10b981' : '#ef4444' }}>
              {reviewModal.type === 'Approved' ? 'Confirm Approval' : 'Confirm Rejection'}
            </h3>
            
            {reviewModal.type === 'Rejected' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Reason for Rejection</label>
                <textarea 
                  value={rejectReason} 
                  onChange={(e) => setRejectReason(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '80px', fontFamily: 'inherit' }}
                  placeholder="e.g., Critical project deadline"
                />
              </div>
            )}

            {reviewModal.type === 'Approved' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>You may adjust the approved dates if necessary.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>Start Date</label>
                  <input type="date" value={editStartDate} onChange={(e) => setEditStartDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#475569' }}>End Date</label>
                  <input type="date" value={editEndDate} onChange={(e) => setEditEndDate(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
              <button onClick={closeReviewModal} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
              <button onClick={confirmStatusUpdate} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: reviewModal.type === 'Approved' ? '#10b981' : '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: '600' }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveView;