import React from 'react';
import styles from '../HRDashboardLayout.module.css';

const MutationSuccessModal = ({ isOpen, onClose, collectionName }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className={styles.modalContent} 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '420px', textAlign: 'center', padding: '28px' }}
      >
        {/* Animated Checkmark Circle Indicator SVG */}
        <div style={{ padding: '10px 0' }}>
          <div 
            style={{ 
              width: '60px', 
              height: '60px', 
              backgroundColor: '#e0e7ff', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto',
              border: '2px solid #c7d2fe'
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        {/* Content Body Stack */}
        <div style={{ marginTop: '16px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0' }}>
            Database Cluster Synced
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.5', margin: '0 0 20px 0' }}>
            Securely pushed document patches for collection <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#4f46e5', backgroundColor: '#eff6ff', padding: '2px 6px', borderRadius: '4px' }}>"{collectionName}"</span> to MongoDB database engine server.
          </p>
        </div>

        {/* Action Acknowledgement Dismissal */}
        <button 
          type="button" 
          className={styles.primaryActionButton} 
          onClick={onClose}
          style={{ width: '100%', padding: '12px', backgroundColor: '#4f46e5', borderRadius: '8px', fontWeight: '600', margin: 0 }}
        >
          Acknowledge & Close
        </button>
      </div>
    </div>
  );
};

export default MutationSuccessModal;