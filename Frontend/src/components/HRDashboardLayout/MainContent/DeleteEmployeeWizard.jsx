import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';

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
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        
        {/* ── STEP 1: INITIAL CONFIRMATION DIALOG ── */}
        {currentStep === 1 && (
          <div className={styles.wizardStepBody}>
            <div className={styles.wizardWarningHeader}>
              <div className={styles.warningIconCircle}>!</div>
              <h2>Delete Employee Profile?</h2>
            </div>
            <p className={styles.wizardSubtitleText}>
              Are you sure you want to delete the profile for<br />
              <strong>{employee.name} ({employee.id})</strong>?
            </p>
            <p className={styles.wizardMutedText}>This action cannot be undone.</p>
            
            <div className={styles.wizardFooterActions}>
              <button className={styles.secondaryActionButton} onClick={onClose}>
                Cancel
              </button>
              <button className={styles.dangerActionButton} onClick={handleNextStep}>
                Delete
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: SECURE INPUT TEXT MATCH ENFORCEMENT ── */}
        {currentStep === 2 && (
          <form onSubmit={handleFinalSubmission} className={styles.wizardStepBody}>
            <div className={styles.wizardHeaderSimple}>
              <h2>Confirm Secure Deletion</h2>
              <p className={styles.wizardSubtitleText}>
                To confirm, please type the employee name exactly as written below:
              </p>
            </div>

            <div className={styles.nameTemplateTargetBox}>
              {employee.name}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmNameInput">Type Name Here</label>
              <input
                type="text"
                id="confirmNameInput"
                placeholder="Enter full name"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                autoComplete="off"
                className={typedName.trim() === employee.name ? styles.inputValidMatch : styles.inputInvalidMatch}
                required
              />
            </div>

            <div className={styles.wizardFooterActions}>
              <button type="button" className={styles.secondaryActionButton} onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.dangerActionButton}
                disabled={typedName.trim() !== employee.name}
              >
                Confirm Delete
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: SUCCESS PURGE LOG SUMMARY BROADCAST ── */}
        {currentStep === 3 && (
          <div className={styles.wizardStepBody}>
            <button className={styles.modalCloseTopCornerBtn} onClick={onClose}>&times;</button>
            
            <div className={styles.wizardSuccessHeader}>
              <div className={styles.successIconCircle}>
                {/* Trash Icon Representation svg markup */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </div>
              <h2 className={styles.successTitleLabel}>Employee Profile Deleted</h2>
              <p className={styles.wizardMutedText}>The following database record has been safely scrubbed.</p>
            </div>

            <div className={styles.purgeSummaryMetadataGrid}>
              <div className={styles.summaryMetaRow}>
                <div>
                  <span className={styles.metaLabelText}>Terminated ID:</span>
                  <strong className={styles.metaValueText}>{employee.id}</strong>
                </div>
                <div>
                  <span className={styles.metaLabelText}>Employee Name:</span>
                  <strong className={styles.metaValueText}>{employee.name}</strong>
                </div>
              </div>
              <div className={styles.summarySystemLogsBox}>
                <p><strong>action system log:</strong> <span>Profile permanently purged</span></p>
                <p><strong>seat allocation:</strong> <span>Released back to {employee.dept} pool</span></p>
              </div>
            </div>

            <button className={styles.returnDirectoryButton} onClick={onClose}>
              Return to Directory
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default DeleteEmployeeWizard;