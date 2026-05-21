import React from 'react';
import styles from '../AdminDashboardLayout.module.css';

const EmployeeSuccessModal = ({ isOpen, onClose, employeeData, mode }) => {
  if (!isOpen || !employeeData) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${styles.modalContentSuccess}`}>
        <div className={styles.successIcon}>
          <span>&#10003;</span>
        </div>
        
        <h2 className={styles.successTitle}>
          Employee Profile {mode === 'create' ? 'Created' : 'Updated'}!
        </h2>
        <p className={styles.successSubtitle}>
          The following employee record was successfully {mode === 'create' ? 'created' : 'updated'}.
        </p>
        
        <div className={styles.successDetailsCard}>
          <div className={styles.successDetailsHeader}>
            <div className={styles.successDetailsColumn}>
              <div className={styles.successLabel}>Employee ID:</div>
              <div className={styles.successValue}>{employeeData.id}</div>
            </div>
            <div className={styles.successDetailsColumn}>
              <div className={styles.successLabel}>Employee Name:</div>
              <div className={styles.successValue}>{employeeData.name}</div>
            </div>
          </div>
          
          <div className={styles.successDetailsBody}>
            <div className={styles.successDetailRow}>
              <strong>{mode === 'create' ? 'designation:' : 'updated designation:'}</strong> 
              <span>{employeeData.role}</span>
            </div>
            <div className={styles.successDetailRow}>
              <strong>{mode === 'create' ? 'department:' : 'updated department:'}</strong> 
              <span>{employeeData.dept}</span>
            </div>
          </div>
        </div>

        <div className={styles.successActions}>
          <button className={styles.btnPrimary} onClick={onClose}>
            View Profile
          </button>
          <button className={styles.btnOutline} onClick={onClose}>
            Back to Directory
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSuccessModal;
