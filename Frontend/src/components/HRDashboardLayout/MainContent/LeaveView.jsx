import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';
import { publishAnnouncement, getTargetOptions } from '../../../lib/axios';
import { MdOutlineCalendarToday } from 'react-icons/md';
import { IoCloseOutline, IoChevronDown } from 'react-icons/io5';

// Inline CSS style mappings exactly matching the SVG design coordinates
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(26, 32, 44, 0.65)',
    backgroundImage: 'radial-gradient(circle, rgba(74, 85, 104, 0.4) 0%, rgba(26, 32, 44, 0.6) 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    margin: 0,
    padding: 0,
    boxSizing: 'border-box',
  },
  modal: {
    backgroundColor: '#ffffff',
    width: '470px',
    borderRadius: '16px',
    boxShadow: '0 10px 16px rgba(0,0,0,0.2)', // Filter from SVG
    overflow: 'hidden',
    boxSizing: 'border-box',
  },
  modalHeader: {
    padding: '24px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #f1f5f9',
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#475569',
    fontSize: '24px',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: '28px',
  },
  fieldGroup: {
    marginBottom: '20px',
  },
  fieldLabel: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  inputBase: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '15px',
    borderRadius: '6px',
    border: '1px solid #cbd5e1',
    boxSizing: 'border-box',
    color: '#0f172a',
    backgroundColor: '#ffffff',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    outline: 'none',
  },
  dateContainer: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'space-between',
    width: '100%',
  },
  inputIconWrapper: {
    position: 'relative',
    flex: '1',
    width: '100%',
  },
  inputWithIcon: {
    paddingRight: '40px', // Space for the icon
    cursor: 'pointer',
  },
  calendarIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#0f172a',
    fontSize: '20px',
    pointerEvents: 'none', // Clicking icon shouldn't prevent input focus
  },
  textareaWrapper: {
    position: 'relative',
  },
  textareaInput: {
    minHeight: '86px',
    fontFamily: 'inherit',
    color: '#0f172a',
    resize: 'none',
    boxSizing: 'border-box',
    lineHeight: '1.4',
  },
  textareaResizeHandle: {
    position: 'absolute',
    bottom: '6px',
    right: '6px',
    width: '12px',
    height: '12px',
    pointerEvents: 'none',
  },
  modalFooter: {
    padding: '16px 28px 24px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '16px',
  },
  buttonBase: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'inherit',
  },
  cancelButton: {
    backgroundColor: '#ffffff',
    color: '#334155',
    border: '1px solid #cbd5e1',
    width: '86px',
  },
  submitButton: {
    backgroundColor: '#4f46e5',
    color: '#ffffff',
    width: '138px',
  },
  dropdownIcon: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#334155',
    fontSize: '18px',
    pointerEvents: 'none',
  },
};

const LeaveView = () => {
  // 1. DATA SOURCE STATE ARRAY (Employee leave requests that HR reviews)
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

  // 2. DYNAMIC TARGET FINDER FOR ADMIN USER
  const [adminUserId, setAdminUserId] = useState('');

  useEffect(() => {
    const fetchAdminId = async () => {
      try {
        const { data } = await getTargetOptions();
        if (data && data.users) {
          const adminUser = data.users.find(u => u.role.toLowerCase() === 'admin');
          if (adminUser) {
            setAdminUserId(adminUser.id);
          }
        }
      } catch (err) {
        console.error('Error fetching admin ID for leave requests:', err);
      }
    };
    fetchAdminId();
  }, []);

  // 3. ACTION: HR Reviews Employee Requests
  const handleStatusUpdate = (id, newStatus) => {
    setLeaveRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === id ? { ...request, status: newStatus } : request
      )
    );
  };

  // 4. LEAVE MODAL AND INPUT STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState('Casual Leave (CL)');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Today's date in YYYY-MM-DD format to prevent past leave requests
  const todayStr = new Date().toISOString().split('T')[0];

  // 5. ACTION: Submit Custom Leave Form and Notify Admin
  const handleSubmitLeave = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      alert('End Date must be on or after Start Date.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: 'HR Leave Request',
        description: `HR Admin has requested ${leaveType} (from ${startDate} to ${endDate}) for reason: "${reason.trim()}". Pending Admin approval.`,
        category: 'HR Notice',
        priority: 'High',
        targetAudience: adminUserId ? 'individual' : 'all',
        targetRecipient: adminUserId || undefined
      };

      await publishAnnouncement(payload);

      alert(`📣 Leave request submitted successfully!\nA notification containing your dates and reason has been sent directly to the Admin.`);

      // Reset form states
      setStartDate('');
      setEndDate('');
      setReason('');
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to submit simulated leave request:', err);
      alert('Error sending leave request notification.');
    } finally {
      setSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. DYNAMIC ANALYTICS CALCULATIONS ENGINE
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

  const getValidationStyle = (status) => {
    switch (status) {
      case 'Approved':
        return styles.statusActive;
      case 'Rejected':
        return styles.statusLabelRed;
      case 'Pending':
      default:
        return styles.statusOnboard;
    }
  };

  return (
    <div className={styles.dashboardGrid}>

      {/* ── Analytical Metrics Row ── */}
      <div className={styles.chartsRow}>

        {/* LEFT COMPONENT: Dynamic Monthly Leave Proportions */}
        <div className={styles.chartContainer}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
            Monthly Leave Class Proportions
          </h3>
          <div className={styles.chartPlaceholderVertical}>
            
            <div className={styles.deptMetricRow} style={{ gridTemplateColumns: '140px 1fr 50px' }}>
              <span className={styles.deptName}>Casual Leave (CL)</span>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarFill} style={{ width: clDisplayWidth, backgroundColor: '#635bff' }}></div>
              </div>
              <strong className={styles.deptCount}>{totalApproved > 0 ? `${clPercent}%` : '64%'}</strong>
            </div>

            <div className={styles.deptMetricRow} style={{ gridTemplateColumns: '140px 1fr 50px' }}>
              <span className={styles.deptName}>Sick Leave (SL)</span>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarFill} style={{ width: slDisplayWidth, backgroundColor: '#10b981' }}></div>
              </div>
              <strong className={styles.deptCount}>{totalApproved > 0 ? `${slPercent}%` : '22%'}</strong>
            </div>

            <div className={styles.deptMetricRow} style={{ gridTemplateColumns: '140px 1fr 50px' }}>
              <span className={styles.deptName}>Earned Leave (EL)</span>
              <div className={styles.progressBarContainer}>
                <div className={styles.progressBarFill} style={{ width: elDisplayWidth, backgroundColor: '#f59e0b' }}></div>
              </div>
              <strong className={styles.deptCount}>{totalApproved > 0 ? `${elPercent}%` : '14%'}</strong>
            </div>

          </div>
        </div>

        {/* RIGHT COMPONENT: Dynamic Operational Metrics Card */}
        <div className={styles.chartContainer}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: '700', color: '#1e293b' }}>
            Operational Balance Metrics
          </h3>
          <div className={styles.operationalContainer}>
            <span className={styles.subTextEmail} style={{ fontSize: '0.85rem', fontWeight: '500' }}>
              Active Absences (Today)
            </span>
            <div className={styles.hugeHighlightedValue} style={{ margin: '12px 0' }}>
              {approvedAbsencesCount} {approvedAbsencesCount === 1 ? 'Employee' : 'Employees'}
            </div>
            <div className={styles.complianceSafeBadge}>
              ✓ Staffing limits within safe thresholds ({computedAvailability}% available)
            </div>
          </div>
        </div>

      </div>

      {/* ── Table Action Filter Bar with single '+ Apply for Leave' trigger ── */}
      <div className={styles.actionFilterBar} style={{ marginTop: '10px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Absence Governance Ledger</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className={styles.primaryActionButton}
          type="button"
        >
          + Apply for Leave
        </button>
      </div>

      {/* Review table requests ledger */}
      <div className={styles.activityStream} style={{ marginTop: 0 }}>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>EMPLOYEE</th>
              <th>CLASSIFICATION</th>
              <th>CHRONO RANGE</th>
              <th>STATUS VALIDATION</th>
              <th>GOVERNANCE ACTION</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((request) => {
              const isFinalized = request.status === 'Approved' || request.status === 'Rejected';

              return (
                <tr key={request.id}>
                  <td><strong style={{ color: '#0f172a', fontWeight: '700' }}>{request.employee}</strong></td>
                  <td style={{ color: '#475569', fontWeight: '500' }}>{request.classification}</td>
                  <td style={{ color: '#475569', fontWeight: '500' }}>{request.chronoRange}</td>
                  <td>
                    <span className={`${styles.statusLabel} ${getValidationStyle(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td>
                    {isFinalized ? (
                      <button className={styles.inlineTableButtonDisabled} style={{ width: '100%', textAlign: 'center' }} disabled>
                        {request.status}
                      </button>
                    ) : (
                      <div className={styles.rightActionButtonGroup} style={{ gap: '8px' }}>
                        <button
                          className={styles.inlineTableButton}
                          onClick={() => handleStatusUpdate(request.id, 'Approved')}
                          type="button"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                        >
                          Approve
                        </button>
                        <button
                          className={styles.dangerInlineActionButton}
                          style={{ padding: '6px 14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
                          onClick={() => handleStatusUpdate(request.id, 'Rejected')}
                          type="button"
                          style={{ padding: '6px 12px', fontSize: '0.85rem' }}
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

      {/* ── APPLY FOR LEAVE MODAL OVERLAY FORM (HIGH FIDELITY REACT TRANSLATION) ── */}
      {isModalOpen && (
        <div style={modalStyles.overlay} onClick={() => setIsModalOpen(false)}>
          <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>

            {/* Header */}
            <div style={modalStyles.modalHeader}>
              <h2 style={modalStyles.modalTitle}>Request Leave from Admin</h2>
              <button
                type="button"
                style={modalStyles.closeButton}
                onClick={() => setIsModalOpen(false)}
                aria-label="Close modal"
              >
                <IoCloseOutline />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmitLeave}>
              <div style={modalStyles.modalBody}>

                {/* Leave Type */}
                <div style={modalStyles.fieldGroup}>
                  <label htmlFor="leaveType" style={modalStyles.fieldLabel}>Leave Type</label>
                  <div style={modalStyles.inputIconWrapper}>
                    <select
                      id="leaveType"
                      style={modalStyles.inputBase}
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      required
                    >
                      <option value="Casual Leave (CL)">Casual Leave (CL)</option>
                      <option value="Sick Leave (SL)">Sick Leave (SL)</option>
                      <option value="Earned Leave (EL)">Earned Leave (EL)</option>
                    </select>

                  </div>
                </div>

                {/* Start and End Date inline container */}
                <div style={modalStyles.dateContainer}>
                  <div style={{ ...modalStyles.fieldGroup, flex: 1 }}>
                    <label htmlFor="startDate" style={modalStyles.fieldLabel}>Start Date *</label>
                    <div style={modalStyles.inputIconWrapper}>
                      <input
                        type="date"
                        id="startDate"
                        min={todayStr}
                        style={{ ...modalStyles.inputBase, ...modalStyles.inputWithIcon }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                      <MdOutlineCalendarToday style={modalStyles.calendarIcon} />
                    </div>
                  </div>
                  <div style={{ ...modalStyles.fieldGroup, flex: 1 }}>
                    <label htmlFor="endDate" style={modalStyles.fieldLabel}>End Date *</label>
                    <div style={modalStyles.inputIconWrapper}>
                      <input
                        type="date"
                        id="endDate"
                        min={startDate || todayStr}
                        style={{ ...modalStyles.inputBase, ...modalStyles.inputWithIcon }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                      <MdOutlineCalendarToday style={modalStyles.calendarIcon} />
                    </div>
                  </div>
                </div>

                {/* Reason for Leave */}
                <div style={modalStyles.fieldGroup}>
                  <label htmlFor="reason" style={modalStyles.fieldLabel}>Reason for Leave *</label>
                  <div style={modalStyles.textareaWrapper}>
                    <textarea
                      id="reason"
                      placeholder="Describe your reason for requesting leave here..."
                      style={{ ...modalStyles.inputBase, ...modalStyles.textareaInput }}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                    {/* Textarea Resize Handle Accent from SVG */}
                    <svg style={modalStyles.textareaResizeHandle} width="12" height="12" viewBox="0 0 12 12">
                      <path d="M6 10 L10 6 M2 10 L10 2" stroke="#cbd5e1" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={modalStyles.modalFooter}>
                <button
                  style={{ ...modalStyles.buttonBase, ...modalStyles.cancelButton }}
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  style={{ ...modalStyles.buttonBase, ...modalStyles.submitButton }}
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default LeaveView;