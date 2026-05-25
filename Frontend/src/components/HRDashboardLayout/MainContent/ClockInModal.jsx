import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';

const ClockInModal = ({ isOpen, onClose, onConfirmClockIn }) => {
  const [currentTime, setCurrentTime] = useState('');
  const [shiftData, setShiftData] = useState({
    shiftType: 'Regular Shift (09:00 AM - 06:00 PM)',
    workMode: 'On-Site',
    notes: ''
  });

  // Keep a running ticker of the exact system clock inside the popup form
  useEffect(() => {
    if (isOpen) {
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setShiftData((prev) => ({ ...prev, id: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmClockIn(shiftData);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className={styles.modalHeader}>
          <h2>Shift Session Initialize</h2>
          <button className={styles.modalCloseBtn} onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* Running Digital Clock Frame Display */}
          <div className={styles.nameTemplateTargetBox} style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a', textAlign: 'center', padding: '20px' }}>
            <span style={{ fontSize: '0.8rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#15803d', fontWeight: '600', marginBottom: '4px' }}>
              Current System Time
            </span>
            <strong style={{ fontSize: '2rem', fontFamily: 'monospace', letterSpacing: '0.02em' }}>{currentTime}</strong>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="shiftType">Select Allocated Shift Profile</label>
            <select id="shiftType" value={shiftData.shiftType} onChange={handleChange}>
              <option value="Regular Shift (09:00 AM - 06:00 PM)">Regular Shift (09:00 AM - 06:00 PM)</option>
              <option value="Morning Shift (07:00 AM - 04:00 PM)">Morning Shift (07:00 AM - 04:00 PM)</option>
              <option value="Night Shift (10:00 PM - 07:00 AM)">Night Shift (10:00 PM - 07:00 AM)</option>
            </select>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="workMode">Operating Environment Mode</label>
            <select id="workMode" value={shiftData.workMode} onChange={handleChange}>
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
            />
          </div>

          <div className={styles.modalActionButtons} style={{ marginTop: '4px' }}>
            <button type="button" className={styles.secondaryActionButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.successActionButton} style={{ padding: '10px 24px', borderRadius: '10px' }}>
              Confirm Clock In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClockInModal;