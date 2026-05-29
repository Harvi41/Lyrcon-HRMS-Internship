import React, { useState, useEffect } from 'react';
import { getDeviceFingerprint } from '../../../lib/attendanceHelper';
import styles from '../HRDashboardLayout.module.css';

const ClockInModal = ({ isOpen, onClose, onConfirmClockIn }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [shiftData, setShiftData] = useState({
    shiftType: 'Regular Shift (09:00 AM - 06:00 PM)',
    workMode: 'On-Site',
    notes: ''
  });

  // Keep a running ticker of the exact system clock inside the popup form
  useEffect(() => {
    if (isOpen) {
      setSecurityError(''); // Clear previous runtime alerts on open
      const updateClock = () => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      };
      updateClock();
      const intervalId = setInterval(updateClock, 1000);
      return () => clearInterval(intervalId);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // FIXED: Evaluates dynamic input element keys accurately using ES6 computer property syntax [id]
  const handleChange = (e) => {
    const { id, value } = e.target;
    setShiftData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setSecurityError('');

    // 1. Extract browser hardware signature identifier
    const hardwareToken = await getDeviceFingerprint();

    if (!hardwareToken) {
      setSecurityError('Security Failure: Unable to calculate machine validation fingerprint.');
      setIsVerifying(false);
      return;
    }

    // 2. Append hardware token securely to operational parameters payload
    const completePayload = {
      ...shiftData,
      deviceToken: hardwareToken
    };

    try {
      // 3. Delegate transaction control back up to parent container API async logic
      await onConfirmClockIn(completePayload);
      onClose();
    } catch (error) {
      // Intercept rejections directly inside the component UI context
      const serverMsg = error.response?.data?.message || 'Access Denied: Shift authorization failed.';
      setSecurityError(serverMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        
        {/* Header Block Row */}
        <div className={styles.modalHeader}>
          <h2>Shift Session Initialize</h2>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          
          {/* Running Digital Clock Frame Display */}
          <div className={styles.nameTemplateTargetBox} style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a', textAlign: 'center', padding: '20px', borderRadius: '8px', border: '1px solid' }}>
            <span style={{ fontSize: '0.8rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803d', fontWeight: '600', marginBottom: '4px' }}>
              Current System Time
            </span>
            <strong style={{ fontSize: '2rem', fontFamily: 'monospace', letterSpacing: '0.02em' }}>{currentTime}</strong>
          </div>

          {/* Core Selection Fields */}
          <div className={styles.inputGroup}>
            <label htmlFor="shiftType">Select Allocated Shift Profile</label>
            <select id="shiftType" value={shiftData.shiftType} onChange={handleChange} disabled={isVerifying}>
              <option value="Regular Shift (09:00 AM - 06:00 PM)">Regular Shift (09:00 AM - 06:00 PM)</option>
              <option value="Morning Shift (07:00 AM - 04:00 PM)">Morning Shift (07:00 AM - 04:00 PM)</option>
              <option value="Night Shift (10:00 PM - 07:00 AM)">Night Shift (10:00 PM - 07:00 AM)</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="workMode">Operating Environment Mode</label>
            <select id="workMode" value={shiftData.workMode} onChange={handleChange} disabled={isVerifying}>
              <option value="On-Site">On-Site (HQ Workspace Office)</option>
              <option value="Remote">Remote (Telecommuting Framework)</option>
              <option value="Hybrid">Hybrid Operational Branch</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="notes">Session Notes / Task Focus <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Optional)</span></label>
            <input
              type="text"
              id="notes"
              placeholder="e.g., CoreHR routing optimization"
              value={shiftData.notes}
              onChange={(e) => setShiftData((prev) => ({ ...prev, notes: e.target.value }))}
              autoComplete="off"
              disabled={isVerifying}
            />
          </div>

          {/* ADDED: Dynamic Error Output Warning Block */}
          {securityError && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
              padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '500', lineHeight: '1.4', textAlign: 'left'
            }}>
              ⚠️ {securityError}
            </div>
          )}

          {/* Action Trigger Buttons Footer Row */}
          <div className={styles.modalActionButtons} style={{ marginTop: '4px' }}>
            <button type="button" className={styles.secondaryActionButton} onClick={onClose} disabled={isVerifying}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.successActionButton} 
              style={{ padding: '10px 24px', borderRadius: '10px', minWidth: '150px' }}
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying Device...' : 'Confirm Clock In'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default ClockInModal;