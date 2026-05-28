import React from "react";
import styles from "../EmployeeDashboardLayout.module.css";

const pageTitles = (name) => ({
  dashboard:     `Welcome Back, ${name || "User"}`,
  tasks:         "Tasks",
  attendance:    "Attendance",
  leave:         "Leave Management",
  payroll:       "Payroll",
  announcements: "Announcements",
});

export default function Header({ activePage, onLogout, user }) {
  // Dynamically pull the name from the session object, fallback if missing
  const currentUserName = user?.name || "Employee";
  const avatarLetter = currentUserName.charAt(0).toUpperCase();

  return (
    <header className={styles.topbar}>
      <h1 className={styles.pageTitle}>
        {pageTitles(currentUserName)[activePage] || ""}
      </h1>
      
      <div className={styles.userInfo}>
        <div className={styles.profileWrapper} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Dynamic User Name Display */}
          <span className={styles.userName}>{currentUserName}</span>
          {/* Dynamic Avatar Initials */}
          <span className={styles.avatar}>{avatarLetter}</span>
        </div>

        <button 
          className={styles.signOutBtn} 
          onClick={onLogout}
          style={{
            marginLeft: '15px',
            padding: '6px 16px',
            backgroundColor: '#ffffff',
            color: '#6366f1',
            border: '2px solid #6366f1',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.18s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f1f5f9';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#ffffff';
          }}
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}