import React from 'react';
import styles from '../AdminDashboardLayout.module.css'; // Importing styles from the layout CSS

const Header = ({ title, userName, avatarLetter, onLogout }) => {
  return (
    <header className={styles.topHeader}>
      <h1 className={styles.pageTitle}>{title}</h1>
      <div className={styles.userInfo}>
        <span className={styles.userName}>{userName}</span>
        <div className={styles.userAvatar}>{avatarLetter}</div>
        {onLogout ? (
          <button type="button" className={styles.logoutButton} onClick={onLogout}>
            Sign out
          </button>
        ) : null}
      </div>
    </header>
  );
};

export default Header;