// DeleteEmployeeWizard.jsx
import React, { useState, useEffect } from 'react';
import styles from '../AdminDashboardLayout.module.css';

const DeleteEmployeeWizard = ({ isOpen, employee, onClose, onConfirmPurge }) => {
  const [currentStep, setCurrentStep] = useState(1); // Track workflow wizard steps
  const [typedName, setTypedName] = useState('');

  // Reset local state whenever the wizard closes/opens
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setTypedName('');
    }
  }, [isOpen]);

  if (!isOpen || !employee) return null;

  const handleNextStep = () => setCurrentStep(2);

  const handleFinalSubmission = (e) => {
    e.preventDefault();
    if (typedName.trim() === employee.name) {
      onConfirmPurge(employee.id); // Execute data mutation slice
      setCurrentStep(3); // Route to final success card summary layout
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={currentStep === 3 ? onClose : undefined}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '480px' }}>
        
        {/* ── STEP 1: INITIAL CONFIRMATION DIALOG ── */}
        {currentStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', alignItems: 'center' }}>
            {/* Warning Icon Badge */}
            <div className={styles.userAvatar} style={{ width: '56px', height: '56px', backgroundColor: '#fee2e2', color: '#b91c1c', fontSize: '1.5rem', marginBottom: '16px', fontWeight: '700' }}>
              !
            </div>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: '0 0 10px 0' }}>
              Delete Employee Profile?
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 6px 0', lineHeight: '1.5' }}>
              Are you sure you want to delete the profile for<br />
              <strong style={{ color: '#0f172a', fontWeight: '700' }}>{employee.name} ({employee.id})</strong>?
            </p>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', margin: '0 0 24px 0', fontWeight: '500' }}>
              This action cannot be undone.
            </p>
            
            <div className={styles.modalActionButtons} style={{ width: '100%', border: 'none', padding: 0, margin: 0, gap: '12px' }}>
              <button type="button" className={styles.btnCancel} onClick={onClose} style={{ flex: 1 }}>
                Cancel
              </button>
              <button type="button" className={styles.dangerInlineActionButton} onClick={handleNextStep} style={{ flex: 1, padding: '10px 20px', fontSize: '0.9rem' }}>
                Delete
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: SECURE INPUT TEXT MATCH ENFORCEMENT ── */}
        {currentStep === 2 && (
          <form onSubmit={handleFinalSubmission} style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#0f172a', margin: '0 0 6px 0' }}>
                Confirm Secure Deletion
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#475569', margin: 0, lineHeight: '1.4' }}>
                To confirm, please type the employee name exactly as written below:
              </p>
            </div>

            {/* Target Display Box */}
            <div className={styles.activityStream} style={{ padding: '12px', textAlign: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px', boxShadow: 'none' }}>
              {employee.name}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '24px' }}>
              <label htmlFor="confirmNameInput" style={{ fontSize: '0.82rem', color: '#475569', fontWeight: '600' }}>
                Type Name Here
              </label>
              <input
                type="text"
                id="confirmNameInput"
                placeholder="Enter full name"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                autoComplete="off"
                required
                style={{ 
                  padding: '10px 14px', 
                  border: typedName.trim() === employee.name ? '1px solid #16a34a' : '1px solid #cbd5e1', 
                  borderRadius: '8px', 
                  fontSize: '0.92rem', 
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              />
            </div>

            <div className={styles.modalActionButtons} style={{ border: 'none', padding: 0, margin: 0, gap: '12px' }}>
              <button type="button" className={styles.btnCancel} onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.dangerInlineActionButton}
                disabled={typedName.trim() !== employee.name}
                style={{ 
                  padding: '10px 20px', 
                  fontSize: '0.9rem',
                  opacity: typedName.trim() !== employee.name ? 0.5 : 1,
                  cursor: typedName.trim() !== employee.name ? 'not-allowed' : 'pointer'
                }}
              >
                Confirm Delete
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: SUCCESS PURGE LOG SUMMARY BROADCAST ── */}
        {currentStep === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center', alignItems: 'center' }}>
            
            <div className={styles.userAvatar} style={{ width: '56px', height: '56px', backgroundColor: '#fee2e2', color: '#dc2626', fontSize: '1.5rem', marginBottom: '16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </div>
            
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' }}>
              Employee Profile Deleted
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px 0', fontWeight: '500' }}>
              The following database record has been safely scrubbed.
            </p>

            {/* Metadata Summary Card */}
            <div className={styles.metricCard} style={{ width: '100%', background: '#f8fafc', padding: '16px', textAlign: 'left', marginBottom: '24px', boxSizing: 'border-box' }}>
              <div className={styles.formRowGrid} style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '12px', marginBottom: '12px' }}>
                <div className={styles.preferenceNodeCell}>
                  <span className={styles.preferenceMetaLabel}>Terminated ID</span>
                  <span className={styles.preferenceValueText} style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{employee.id}</span>
                </div>
                <div className={styles.preferenceNodeCell}>
                  <span className={styles.preferenceMetaLabel}>Employee Name</span>
                  <span className={styles.preferenceValueText} style={{ fontSize: '0.9rem' }}>{employee.name}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', fontFamily: 'monospace' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>action system log:</span>
                  <span style={{ color: '#b91c1c', fontWeight: '600' }}>Profile permanently purged</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>seat allocation:</span>
                  <span style={{ color: '#334155', fontWeight: '600' }}>Released to {employee.dept} pool</span>
                </div>
              </div>
            </div>

            <button 
              className={styles.primaryActionButton} 
              onClick={onClose}
              type="button"
              style={{ width: '100%', padding: '11px', background: '#0f172a' }}
            >
              Return to Directory
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DeleteEmployeeWizard;