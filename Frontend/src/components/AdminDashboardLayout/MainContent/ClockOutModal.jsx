import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';

const ClockOutModal = ({ isOpen, onClose, onConfirmClockOut }) => {
  const [handoverNotes, setHandoverNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmClockOut(handoverNotes);
    setHandoverNotes(''); // Clear input buffer
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <div className={styles.modalHeader}>
          <h2>Terminate Shift Session</h2>
          <button className={styles.modalCloseBtn} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* Shift Session Real-time Duration Card Indicator */}
          <div className={styles.nameTemplateTargetBox} style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca', color: '#dc2626', textAlign: 'center', padding: '18px' }}>
            <span style={{ fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#991b1b', fontWeight: '600', marginBottom: '2px' }}>
              Logged Active Duration
            </span>
            <strong style={{ fontSize: '1.8rem', fontFamily: 'monospace' }}>08 hrs 42 mins</strong>
          </div>

          <p style={{ fontSize: '0.9rem', color: '#475569', margin: '12px 0 4px 0', lineHeight: '1.5' }}>
            You are about to submit your checkout timestamp to the backend server. Make sure all ongoing project threads are safely compiled or handed over.
          </p>

          <div className={styles.inputGroup} style={{ marginTop: '8px' }}>
            <label htmlFor="handoverNotes">Shift Handover Summary <span style={{ color: '#94a3b8', fontWeight: '400' }}>(Optional)</span></label>
            <textarea
              id="handoverNotes"
              placeholder="e.g., Main dashboard modules deployment committed to main branch."
              value={handoverNotes}
              onChange={(e) => setHandoverNotes(e.target.value)}
              rows="3"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'none', fontSize: '0.9rem' }}
            />
          </div>

          <div className={styles.modalActionButtons} style={{ marginTop: '12px' }}>
            <button type="button" className={styles.secondaryActionButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.dangerActionButton} style={{ padding: '10px 24px', borderRadius: '10px' }}>
              Confirm Clock Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClockOutModal;