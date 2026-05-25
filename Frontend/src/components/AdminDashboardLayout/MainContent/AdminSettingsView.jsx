// AdminSettingsView.jsx
import React from 'react';
import styles from '../AdminDashboardLayout.module.css';

const AdminSettingsView = ({ user, onLogout }) => {
  return (
    <div className={styles.dashboardGrid}>
      
      {/* ── Preferences Matrix splitting alongside Profile Overview Card ── */}
      <div className={styles.chartsRow}>
        
        {/* Left: Workspace Preferences Panel Grid */}
        <div className={styles.chartContainer}>
          <h3 className={styles.panelCardHeaderTitle}>
            Workspace Preferences
          </h3>
          
          <div className={styles.settingsPreferencesGrid}>
            <div className={styles.preferenceNodeCell}>
              <span className={styles.preferenceMetaLabel}>Theme</span>
              <p className={styles.preferenceValueText}>Operations Light</p>
            </div>
            <div className={styles.preferenceNodeCell}>
              <span className={styles.preferenceMetaLabel}>Region</span>
              <p className={styles.preferenceValueText}>India / IST</p>
            </div>
            <div className={styles.preferenceNodeCell}>
              <span className={styles.preferenceMetaLabel}>Notification Mode</span>
              <p className={styles.preferenceValueText}>Shift + Email</p>
            </div>
            <div className={styles.preferenceNodeCell}>
              <span className={styles.preferenceMetaLabel}>Security</span>
              <p className={styles.preferenceValueText}>2FA Enabled</p>
            </div>
          </div>
        </div>

        {/* Right: Focused Active Profile Admin Card */}
        <div className={styles.chartContainer}>
          <h3 className={styles.panelCardHeaderTitle}>
            Profile Summary
          </h3>
          
          <div className={styles.profileSummaryCardFlex}>
            <div className={styles.profileAvatarCircleLarge}>
              {user?.name ? user.name.trim()[0].toUpperCase() : 'P'}
            </div>
            <div className={styles.profileIdentityBlock}>
              <h4 className={styles.profileDisplayNameTitle}>
                {user?.name || 'Prince Ghevariya'}
              </h4>
              <span className={styles.profileEmailSubtext}>
                {user?.email || 'prince@lyrcon.com'}
              </span>
            </div>
            <button 
              className={styles.profileSignoutButton} 
              onClick={onLogout}
              type="button"
            >
              Sign out
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminSettingsView;