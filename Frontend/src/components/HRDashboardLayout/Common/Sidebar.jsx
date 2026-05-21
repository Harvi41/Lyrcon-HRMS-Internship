import React from 'react';
import styles from '../HRDashboardLayout.module.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { label: 'Dashboard', id: 'dashboard' },
    { label: 'Employee Overview', id: 'employees' },
    { label: 'Attendance Management', id: 'attendance' },
    { label: 'Leave Management', id: 'leave' },
    { label: 'Payroll', id: 'payroll' },
    { label: 'Recruitment', id: 'recruitment' },
    { label: 'Team Monitoring', id: 'team-monitoring' },
    { label: 'Announcements', id: 'announcements' },
    { label: 'Roles & Permissions', id: 'roles-permissions' } // Added mapping navigation routing node
    { label: 'Asset Management', id: 'assets' }
  ];

  return (
    <nav className={styles.sidebar}>
      {/* Brand Identity Branding Header */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>C</div>
        <span className={styles.logoText}>HR</span>
      </div>
      
      {/* Navigation Links Routing Engine */}
      <div className={styles.menuSection}>
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
    </nav>
  );
};

export default Sidebar;