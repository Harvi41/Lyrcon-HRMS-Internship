// AssetDeleteWizard.jsx
import React, { useState, useEffect } from 'react';
import styles from '../AdminDashboardLayout.module.css';

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
          <div className={styles.wizardStepBody} style={{ padding: '0' }}>
            <div style={{ padding: '32px 32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FEF2F2', border: '2px solid #EF4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', color: '#EF4444', fontSize: '24px', fontWeight: 'bold'
              }}>!</div>
              
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 12px 0' }}>Delete Asset?</h2>
              
              <p style={{ fontSize: '14px', color: '#4B5563', margin: '0 0 16px 0' }}>
                Are you sure you want to delete the asset for
              </p>
              
              <div style={{ background: '#EFF6FF', padding: '8px 24px', borderRadius: '6px', marginBottom: '20px', display: 'inline-block' }}>
                <strong style={{ color: '#1D4ED8', fontSize: '16px', fontWeight: '700' }}>
                  ID - {asset._id}
                </strong>
              </div>
              
              <p style={{ fontSize: '14px', color: '#9CA3AF', margin: '0' }}>This deployment action cannot be undone.</p>
            </div>
            
            <div style={{ height: '1px', backgroundColor: '#E5E7EB', width: '100%' }}></div>
            
            <div style={{ padding: '20px 32px', display: 'flex', justifyContent: 'center', gap: '12px', background: '#F9FAFB', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <button 
                type="button" 
                onClick={onClose}
                style={{ padding: '10px 24px', borderRadius: '6px', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', color: '#374151', fontSize: '14px', fontWeight: '600', cursor: 'pointer', flex: '1', maxWidth: '140px' }}
              >Cancel</button>
              <button 
                type="button" 
                onClick={handleNextStep}
                style={{ padding: '10px 24px', borderRadius: '6px', backgroundColor: '#DC2626', border: 'none', color: '#FFFFFF', fontSize: '14px', fontWeight: '600', cursor: 'pointer', flex: '1', maxWidth: '140px' }}
              >Delete</button>
            </div>
          </div>
        )}

        {/* ── STEP 2: HARDWARE TOKEN VERIFICATION MATCH ── */}
        {currentStep === 2 && (
          <form onSubmit={handleFinalSubmission} className={styles.wizardStepBody} style={{ padding: '0' }}>
            <div style={{ padding: '32px 32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 10px 0' }}>Confirm Delete</h2>
              
              <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 16px 0' }}>
                To confirm, please type the asset ID exactly as written:
              </p>
              
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#1E293B', letterSpacing: '0.5px', marginBottom: '24px' }}>
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
                  fontSize: '13px',
                  fontWeight: '500',
                  width: '100%',
                  boxSizing: 'border-box'
                }}>
                  {errorMsg}
                </div>
              )}

              <div style={{ width: '100%', textAlign: 'left', marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '8px' }}>Type Asset ID Here</label>
                <input 
                  type="text" 
                  required 
                  value={typedId} 
                  onChange={(e) => setTypedId(e.target.value)} 
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '15px',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                  placeholder="e.g., AST-101"
                  disabled={loading}
                />
              </div>
            </div>

            <div style={{ padding: '20px 32px', display: 'flex', justifyContent: 'center', gap: '12px', background: '#F9FAFB', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
              <button 
                type="button" 
                onClick={onClose}
                disabled={loading}
                style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', color: '#0F172A', fontSize: '14px', fontWeight: '600', cursor: 'pointer', flex: '1', maxWidth: '140px' }}
              >Cancel</button>
              
              <button 
                type="submit" 
                disabled={typedId.trim() !== asset._id || loading}
                style={{ 
                  padding: '10px 24px', 
                  borderRadius: '6px', 
                  backgroundColor: (typedId.trim() !== asset._id || loading) ? '#F1F5F9' : '#DC2626', 
                  border: (typedId.trim() !== asset._id || loading) ? '1px solid #E2E8F0' : '1px solid #DC2626', 
                  color: (typedId.trim() !== asset._id || loading) ? '#94A3B8' : '#FFFFFF', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: (typedId.trim() !== asset._id || loading) ? 'not-allowed' : 'pointer', 
                  flex: '1', 
                  maxWidth: '140px' 
                }}
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: TRANSACTION SUCCESS LOG COMPLETED ── */}
        {currentStep === 3 && (
          <div className={styles.wizardStepBody} style={{ padding: '0' }}>
            <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <svg width="36" height="36" viewBox="-10 -10 20 22">
                  <path d="M-8 -4 H8 M-6 -4 V8 A2 2 0 0 0 -4 10 H4 A2 2 0 0 0 6 8 V-4 M-3 -4 V-7 A1 1 0 0 1 -2 -8 H2 A1 1 0 0 1 3 -7 V-4" 
                        fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>

              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0F172A', margin: '0 0 12px 0' }}>Asset Deleted Successfully</h2>
              
              <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 24px 0' }}>The asset record has been scrubbed from inventory states.</p>
              
              <button 
                type="button" 
                onClick={() => onPurgeConfirmed(asset._id)}
                style={{ 
                  width: '200px', 
                  height: '38px', 
                  borderRadius: '8px', 
                  backgroundColor: '#4F46E5', 
                  border: 'none', 
                  color: '#FFFFFF', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  cursor: 'pointer' 
                }}
              >
                Back to Directory
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}