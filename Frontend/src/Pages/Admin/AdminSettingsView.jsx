import React from 'react';
import { AdminPanel } from './AdminDashboardShared';

export default function AdminSettingsView({ userName, user, onLogout }) {
  return (
    <div className="dashboard-grid split-grid">
      <AdminPanel title="Workspace Preferences">
        <div className="settings-grid">
          <div>
            <p className="muted-label">Theme</p>
            <p className="strong">Operations Light</p>
          </div>
          <div>
            <p className="muted-label">Region</p>
            <p className="strong">India / IST</p>
          </div>
          <div>
            <p className="muted-label">Notification Mode</p>
            <p className="strong">Shift + Email</p>
          </div>
          <div>
            <p className="muted-label">Security</p>
            <p className="strong">2FA Enabled</p>
          </div>
        </div>
      </AdminPanel>

      <AdminPanel title="Profile Summary">
        <div className="profile-chip">{userName.charAt(0)}</div>
        <div className="profile-name">{userName}</div>
        <p className="subtle">{user?.email || 'prince@company.com'}</p>
        <button className="ghost-btn" onClick={onLogout}>Sign out</button>
      </AdminPanel>
    </div>
  );
}