// Sidebar.jsx
import React from 'react';
import styles from '../AdminDashboardLayout.module.css';

const Sidebar = ({ activeTab, setActiveTab }) => {
  // Synchronized item array perfectly mirroring the text labels from your layout routes
  const menuItems = [
    { label: 'Dashboard', id: 'Dashboard' },
    { label: 'Users', id: 'Users' },
    { label: 'Employees', id: 'Employees' },
    { label: 'Attendance', id: 'Attendance' },
    { label: 'Leave Management', id: 'Leave Management' },
    { label: 'Payroll', id: 'Payroll' },
    { label: 'Recruitment', id: 'Recruitment' },
    { label: 'Team Monitoring', id: 'Team Monitoring' }, // ADDED: Directly points to your tracking view
    { label: 'Roles & Permissions', id: 'Roles & Permissions' },
    { label: 'Asset Management', id: 'assets' },
    { label: 'Announcements', id: 'Announcements' },
    { label: 'Settings', id: 'Settings' }
  ];

  return (
    <nav className={styles.sidebar}>
      
      {/* Brand Identity Branding Header */}
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>C</div>
        <span className={styles.logoText}>CoreHR</span>
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