import React from "react";
import styles from "../EmployeeDashboardLayout.module.css";

const navItems = [
  { key: "dashboard",     label: "Dashboard" },
  { key: "tasks",         label: "Tasks" },
  { key: "attendance",    label: "Attendance" },
  { key: "leave",         label: "Leave" },
  { key: "payroll",       label: "Payroll" },
  { key: "announcements", label: "Announcements" },
];

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>C</span>
        <span className={styles.brandName}>HR</span>
      </div>
      <nav className={styles.nav}>
        <p className={styles.navLabel}>MAIN MENU</p>
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`${styles.navItem} ${activePage === item.key ? styles.navItemActive : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
