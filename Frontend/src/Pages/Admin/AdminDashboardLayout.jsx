import React, { useEffect, useState } from 'react';
import {
  adminInitialSummary,
  adminNavigation,
  adminSectionMeta,
  adminTitleMap,
} from './adminDashboardData';
import AdminAttendanceView from './AdminAttendanceView';
import AdminDashboardHome from './AdminDashboardHome';
import AdminEmployeesView from './AdminEmployeesView';
import AdminLeaveView from './AdminLeaveView';
import AdminPayrollView from './AdminPayrollView';
import AdminRolesView from './AdminRolesView';
import AdminSettingsView from './AdminSettingsView';
import AdminUsersView from './AdminUsersView';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const sectionComponents = {
  dashboard: AdminDashboardHome,
  users: AdminUsersView,
  employees: AdminEmployeesView,
  attendance: AdminAttendanceView,
  leave: AdminLeaveView,
  payroll: AdminPayrollView,
  roles: AdminRolesView,
  settings: AdminSettingsView,
};

export default function AdminDashboardLayout({ user, onLogout }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [summary, setSummary] = useState(adminInitialSummary);
  const userName = user?.name || 'Prince Ghevariya';
  const activeMeta = adminSectionMeta[activeSection] || adminSectionMeta.dashboard;
  const ActiveSection = sectionComponents[activeSection] || AdminDashboardHome;

  useEffect(() => {
    const token = window.localStorage.getItem('corehr_token');

    if (!token) {
      return;
    }

    let isMounted = true;

    const loadSummary = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (isMounted) {
          setSummary(data);
        }
      } catch {
        // Keep the fallback snapshot if the backend is temporarily unavailable.
      }
    };

    loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="dashboard-app">
      <aside className="dashboard-sidebar">
        <div className="brand-row">
          <div className="brand-mark">C</div>
          <div className="brand-name">CoreHR</div>
        </div>

        <div className="sidebar-label">MAIN MENU</div>
        <nav className="sidebar-nav">
          {adminNavigation.map((item) => (
            <button
              key={item.key}
              className={`sidebar-link ${activeSection === item.key ? 'active' : ''}`}
              onClick={() => setActiveSection(item.key)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-copy">
            <p className="topbar-eyebrow">CoreHR control surface</p>
            <h1>{adminTitleMap[activeSection] || adminTitleMap.dashboard}</h1>
          </div>
          <div className="topbar-user">
            <button className="avatar-button" type="button" onClick={onLogout} aria-label="Log out">
              {userName.charAt(0)}
            </button>
            <div>
              <div className="topbar-name">{userName}</div>
              <div className="subtle">Operations Control</div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="hero-panel">
            <div>
              <p className="hero-eyebrow">{activeMeta.eyebrow}</p>
              <h2 className="hero-title">{adminTitleMap[activeSection] || adminTitleMap.dashboard}</h2>
              <p className="hero-description">{activeMeta.description}</p>
            </div>
            <div className="hero-actions">
              <button className="ghost-btn" type="button">Export</button>
              <button className="main-btn hero-button" type="button">Create report</button>
            </div>
          </section>

          <ActiveSection summary={summary} user={user} userName={userName} onLogout={onLogout} />
        </div>
      </main>
    </div>
  );
}