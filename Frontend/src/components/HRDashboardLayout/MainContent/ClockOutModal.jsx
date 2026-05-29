import React, { useState, useEffect } from 'react';
import { getDeviceFingerprint } from '../../../lib/attendanceHelper';
import styles from '../HRDashboardLayout.module.css';

const ClockOutModal = ({ isOpen, onClose, onConfirmClockOut }) => {
  const [handoverNotes, setHandoverNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [securityError, setSecurityError] = useState('');

  // Clear component validation errors whenever the modal drops into focus
  useEffect(() => {
    if (isOpen) {
      setSecurityError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setSecurityError('');

    // 1. Gather browser hardware token signature verification hash
    const hardwareToken = await getDeviceFingerprint();

    if (!hardwareToken) {
      setSecurityError('Security Failure: Unable to calculate hardware verification signature.');
      setIsVerifying(false);
      return;
    }

    // 2. Wrap payloads with the hardware identifier string
    const completePayload = {
      notes: handoverNotes,
      deviceToken: hardwareToken
    };

    try {
      // 3. Forward pipeline package to the tracking engine parent controller
      await onConfirmClockOut(completePayload);
      setHandoverNotes(''); // Clear input textarea buffer string
      onClose();
    } catch (error) {
      // Capture cross-origin validation alerts directly inside the modal UI view
      const serverMsg = error.response?.data?.message || 'Access Denied: Terminal session clock-out rejected.';
      setSecurityError(serverMsg);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        
        {/* Header Block Row */}
        <div className={styles.modalHeader}>
          <h2>Terminate Shift Session</h2>
          <button type="button" className={styles.modalCloseBtn} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          
          {/* Shift Session Real-time Duration Card Indicator */}
          <div className={styles.nameTemplateTargetBox} style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626', textAlign: 'center', padding: '18px', border: '1px solid', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#991b1b', fontWeight: '600', marginBottom: '2px' }}>
              Logged Active Duration
            </span>
            <strong style={{ fontSize: '1.8rem', fontFamily: 'monospace' }}>08 hrs 42 mins</strong>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#475569', margin: '12px 0 4px 0', lineHeight: '1.5' }}>
            You are about to submit your checkout timestamp to the backend server. Make sure all ongoing project threads are safely compiled or handed over.
          </p>

          {/* Handover Summary Textarea input workspace block */}
          <div className={styles.inputGroup} style={{ marginTop: '8px' }}>
            <label htmlFor="handoverNotes">Shift Handover Summary <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Optional)</span></label>
            <textarea
              id="handoverNotes"
              placeholder="e.g., Main dashboard modules deployment committed to main branch."
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              rows="3"
              disabled={isVerifying}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
            />
          </div>

          {/* Dynamic Error Warning Sub-Node Banner */}
          {securityError && (
            <div style={{
              backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c',
              padding: '12px 14px', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '500', lineHeight: '1.4', textAlign: 'left', marginTop: '8px'
            }}>
              ⚠️ {securityError}
            </div>
          )}

          {/* Action Row Controllers */}
          <div className={styles.modalActionButtons} style={{ marginTop: '12px' }}>
            <button type="button" className={styles.secondaryActionButton} onClick={onClose} disabled={isVerifying}>
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.dangerActionButton} 
              style={{ padding: '10px 24px', borderRadius: '10px', minWidth: '160px' }}
              disabled={isVerifying}
            >
              {isVerifying ? 'Verifying Device...' : 'Confirm Clock Out'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
};

export default ClockOutModal;