// EmployeeSuccessModal.jsx
import React from 'react';
import styles from '../AdminDashboardLayout.module.css';

const EmployeeSuccessModal = ({ isOpen, onClose, employeeData, mode }) => {
  if (!isOpen || !employeeData) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ padding: '32px', maxWidth: '460px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Animated Checkmark Badge Icon using mapping classes */}
        <div className={styles.userAvatar} style={{ width: '56px', height: '56px', backgroundColor: '#d1fae5', color: '#16a34a', fontSize: '1.5rem', marginBottom: '20px' }}>
          <span>&#10003;</span>
        </div>
        
        <h2 style={{ fontSize: '1.35rem', fontWeight: '700', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
          Employee Profile {mode === 'create' ? 'Created' : 'Updated'}!
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#64748b', margin: '0 0 24px 0', lineHeight: '1.5', fontWeight: '500' }}>
          The following employee record was successfully {mode === 'create' ? 'created' : 'updated'} in the system directory database.
        </p>
        
        {/* Profile Snapshot Card Grid using consolidated layout rules */}
        <div className={styles.metricCard} style={{ width: '100%', backgroundColor: '#f8fafc', padding: '18px', marginBottom: '12px', textAlign: 'left', boxSizing: 'border-box' }}>
          <div className={styles.formRowGrid} style={{ borderBottom: '1px dashed #cbd5e1', paddingBottom: '14px', marginBottom: '14px' }}>
            <div className={styles.preferenceNodeCell}>
              <span className={styles.preferenceMetaLabel}>Employee ID</span>
              <span className={styles.preferenceValueText} style={{ fontFamily: 'monospace' }}>{employeeData.id}</span>
            </div>
            <div className={styles.preferenceNodeCell}>
              <span className={styles.preferenceMetaLabel}>Employee Name</span>
              <span className={styles.preferenceValueText}>{employeeData.name}</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>
                {mode === 'create' ? 'Designation:' : 'Updated Designation:'}
              </span>
              <strong style={{ color: '#0f172a', fontWeight: '600' }}>{employeeData.role || employeeData.designation}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ color: '#64748b', fontWeight: '500' }}>
                {mode === 'create' ? 'Department:' : 'Updated Department:'}
              </span>
              <strong style={{ color: '#0f172a', fontWeight: '600' }}>{employeeData.dept || employeeData.department}</strong>
            </div>
          </div>
        </div>

        {/* Dialog Control Triggers Container mapped to existing action bars */}
        <div className={styles.modalActionButtons} style={{ width: '100%', flexDirection: 'column', gap: '10px', marginTop: '16px', border: 'none', padding: 0 }}>
          <button 
            className={styles.btnSubmit} 
            onClick={onClose} 
            type="button"
            style={{ width: '100%', padding: '11px', margin: 0 }}
          >
            View Profile
          </button>
          <button 
            className={styles.btnCancel} 
            onClick={onClose} 
            type="button"
            style={{ width: '100%', padding: '11px', margin: 0 }}
          >
            Back to Directory
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default EmployeeSuccessModal;