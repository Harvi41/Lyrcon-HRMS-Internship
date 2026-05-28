// AssetDeleteWizard.jsx
import React, { useState, useEffect } from 'react';
import styles from '../HRDashboardLayout.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AssetDeleteWizard({ isOpen, asset, onClose, onPurgeConfirmed }) {
  const [currentStep, setCurrentStep] = useState(1); // 1 = Warning prompt, 2 = ID verify, 3 = Cleared state
  const [typedId, setTypedId] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setTypedId('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen || !asset) return null;

  const handleNextStep = () => setCurrentStep(2);

  const handleFinalSubmission = async (e) => {
    e.preventDefault();
    if (typedId.trim() !== asset._id) return;

    setErrorMsg('');
    setLoading(true);
    try {
      const token = window.localStorage.getItem('corehr_token');
      const response = await fetch(`${API_BASE_URL}/api/assets/${asset._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Scrub action failed on ledger states');
      }

      setCurrentStep(3);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'An unexpected error occurred while deleting the asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={currentStep === 3 ? () => onPurgeConfirmed(asset._id) : undefined}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        
        {/* ── STEP 1: VERIFICATION PROMPT ── */}
        {currentStep === 1 && (
          <div className={styles.wizardStepBody}>
            <div className={styles.wizardWarningHeader}>
              <div className={styles.warningIconCircle}>!</div>
              <h2 style={{ fontSize: '1.3rem', margin: 0 }}>Delete Asset?</h2>
            </div>
            <p className={styles.wizardSubtitleText}>
              Are you sure you want to delete the asset for <br />
              <strong style={{ background: '#fee2e2', padding: '4px 10px', borderRadius: '4px', display: 'inline-block', color: '#b91c1c', marginTop: '6px' }}>
                ID - {asset._id}
              </strong>
            </p>
            <p className={styles.wizardMutedText}>This deployment action cannot be undone.</p>
            <div className={styles.wizardFooterActions}>
              <button type="button" className={styles.secondaryActionButton} onClick={onClose}>Cancel</button>
              <button type="button" className={styles.dangerActionButton} onClick={handleNextStep}>Delete</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: HARDWARE TOKEN VERIFICATION MATCH ── */}
        {currentStep === 2 && (
          <form onSubmit={handleFinalSubmission} className={styles.wizardStepBody}>
            <div className={styles.wizardHeaderSimple}>
              <h2 style={{ margin: '0 0 6px 0' }}>Confirm Delete</h2>
              <p className={styles.wizardSubtitleText} style={{ fontSize: '0.88rem', color: '#64748b' }}>
                To confirm, please type the asset ID exactly as written:
              </p>
            </div>
            <div className={styles.nameTemplateTargetBox} style={{ width: '100%', textAlign: 'center', boxSizing: 'border-box' }}>
              {asset._id}
            </div>

            {errorMsg && (
              <div style={{
                backgroundColor: '#fee2e2',
                border: '1px solid #fca5a5',
                color: '#b91c1c',
                padding: '8px 12px',
                borderRadius: '6px',
                marginBottom: '16px',
                fontSize: '0.82rem',
                fontWeight: '500',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                {errorMsg}
              </div>
            )}

            <div className={styles.inputGroup} style={{ width: '100%', textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#475569' }}>Type Asset ID Here</label>
              <input 
                type="text" 
                required 
                value={typedId} 
                onChange={(e) => setTypedId(e.target.value)} 
                className={typedId.trim() === asset._id ? styles.inputValidMatch : styles.inputInvalidMatch} 
                placeholder="e.g., AST-101"
                disabled={loading}
              />
            </div>
            <div className={styles.wizardFooterActions}>
              <button type="button" className={styles.secondaryActionButton} onClick={onClose} disabled={loading}>Cancel</button>
              <button type="submit" className={styles.dangerActionButton} disabled={typedId.trim() !== asset._id || loading}>
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: TRANSACTION SUCCESS LOG COMPLETED ── */}
        {currentStep === 3 && (
          <div className={styles.wizardStepBody}>
            <div className={styles.successIconCircle} style={{ borderColor: '#fee2e2', color: '#dc2626' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </div>
            <h2 className={styles.successTitleLabel} style={{ marginTop: '12px' }}>Asset Deleted Successfully</h2>
            <p className={styles.wizardMutedText} style={{ marginBottom: '24px' }}>The asset record has been scrubbed from inventory states.</p>
            <button type="button" className={styles.returnDirectoryButton} onClick={() => onPurgeConfirmed(asset._id)}>
              Back to Directory
            </button>
          </div>
        )}

      </div>
    </div>
  );
}