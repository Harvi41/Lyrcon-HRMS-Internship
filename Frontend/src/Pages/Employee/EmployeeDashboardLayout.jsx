import React from 'react';
import { AdminPanel } from '../Admin/AdminDashboardShared';

export default function EmployeeDashboardLayout({ user, onLogout }) {
  const userName = user?.name || 'Employee';
  const email = user?.email || 'employee@company.com';
  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];

  return (
    <div className="dashboard-app">
      <main className="dashboard-main" style={{ width: '100%' }}>
        <header className="dashboard-topbar">
          <div className="topbar-copy">
            <p className="topbar-eyebrow">CoreHR employee surface</p>
            <h1>Employee Dashboard</h1>
          </div>
          <div className="topbar-user">
            <button className="avatar-button" type="button" onClick={onLogout} aria-label="Log out">
              {userName.charAt(0)}
            </button>
            <div>
              <div className="topbar-name">{userName}</div>
              <div className="subtle">{email}</div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          <AdminPanel title="My Access" subtitle="Your role controls what you can do.">
            <div className="settings-grid">
              <div>
                <p className="muted-label">Role</p>
                <p className="strong">{user?.role || 'Employee'}</p>
              </div>
              <div>
                <p className="muted-label">Permissions</p>
                <p className="strong">{permissions.length > 0 ? permissions.join(', ') : 'No permissions assigned'}</p>
              </div>
            </div>
          </AdminPanel>
        </div>
      </main>
    </div>
  );
}
