import React from 'react';
import styles from '../HRDashboardLayout.module.css';

const Sidebar = ({ activeTab, setActiveTab, onOpenPasswordModal }) => {
  const menuItems = [
    { label: 'Dashboard', id: 'dashboard' },
    { label: 'Employee Overview', id: 'employees' },
    { label: 'Attendance Management', id: 'attendance' },
    { label: 'Miss Punch Management', id: 'miss-punch' },
    { label: 'Leave Management', id: 'leave' },
    { label: 'Payroll', id: 'payroll' },
    { label: 'Recruitment', id: 'recruitment' },
    { label: 'Roles & Permissions', id: 'roles-permissions' }, // Added mapping navigation routing node
    { label: 'Asset Management', id: 'assets' },
    { label: 'Task Assignment', id: 'tasks' },
    { label: 'Announcements', id: 'announcements' }
  ];

  return (
    <nav className={styles.sidebar}>
      {/* Brand Identity Branding Header */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>C</div>
        <span className={styles.logoText}>HR</span>
      </div>
      
      {/* Navigation Links Routing Engine */}
      <div className={styles.menuSection} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div>
          <h2 className={styles.menuTitle}>MAIN MENU</h2>
          <ul className={styles.menuList}>
            {menuItems.map((item) => {
              const isActive = item.id === activeTab;
              return (
                <li 
                  key={item.id} 
                  className={`${styles.menuItem} ${isActive ? styles.activeMenuItem : ''}`}
                >
                  <button 
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={styles.sidebarMenuButton}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '20px', paddingBottom: '20px' }}>
          <h2 className={styles.menuTitle}>ACCOUNT</h2>
          <ul className={styles.menuList}>
            <li className={styles.menuItem}>
              <button 
                type="button"
                onClick={onOpenPasswordModal}
                className={styles.sidebarMenuButton}
              >
                Change Password
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;