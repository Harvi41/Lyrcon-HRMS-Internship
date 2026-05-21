import React from 'react';
import {
  adminDefaultRecentEmployees,
  adminDepartmentData,
} from './adminDashboardData';
import { AdminDashboardBars, AdminDashboardStatCard, AdminPanel } from './AdminDashboardShared';

export default function AdminDashboardHome({ summary }) {
  const departmentSeries = summary.departmentBreakdown.length > 0 ? summary.departmentBreakdown : adminDepartmentData;
  const recentEmployees = summary.recentEmployees.length > 0 ? summary.recentEmployees : adminDefaultRecentEmployees;
  const recentAssets = summary.recentAssets.length > 0 ? summary.recentAssets : [];
  const highestValue = Math.max(...departmentSeries.map((entry) => entry.value), 1);

  return (
    <>
      <div className="stat-grid">
        <AdminDashboardStatCard label="GLOBAL HEADCOUNT" value={String(summary.totalEmployees || 0)} note={summary.activeEmployees ? `${summary.activeEmployees} active` : 'Live'} />
        <AdminDashboardStatCard label="ACTIVE WORKFORCE RATE" value={`${summary.activeWorkforceRate || 0}%`} note={summary.inactiveEmployees ? `${summary.inactiveEmployees} off` : 'Live'} />
        <AdminDashboardStatCard label="PENDING ACTIONS" value={`${summary.pendingActions || 0} Issues`} note={`${summary.damagedAssets || 0} damaged`} accent="warning" />
      </div>

      <div className="dashboard-grid split-grid">
        <AdminPanel title="Weekly Clock-In Concurrency">
          <AdminDashboardBars />
        </AdminPanel>

        <AdminPanel title="Department Distribution Metrics">
          <div className="department-list">
            {departmentSeries.map((item) => {
              const width = item.width || Math.max(60, Math.round((item.value / highestValue) * 300));

              return (
                <div className="department-row" key={item.label}>
                  <span className="department-label">{item.label}</span>
                  <div className="department-track">
                    <div className={`department-fill ${item.tone || 'primary'}`} style={{ width: `${width}px` }} />
                  </div>
                  <strong className="department-value">{item.value}</strong>
                </div>
              );
            })}
          </div>
        </AdminPanel>
      </div>

      <AdminPanel title="System Activity Stream">
        <div className="activity-table">
          <div className="activity-head row">
            <span>Timestamp</span>
            <span>Actor</span>
            <span>Event Category</span>
            <span>Status Overview</span>
          </div>
          {recentEmployees.slice(0, 2).map((employee, index) => (
            <div className="activity-body row" key={`${employee.email || employee.name}-${index}`}>
              <span className="accent-text">{index === 0 ? 'Now' : 'Recent'}</span>
              <span>{employee.name}</span>
              <span>{employee.department}</span>
              <span className="success-text">{employee.status || 'active'}</span>
            </div>
          ))}
          {recentAssets.slice(0, 1).map((asset) => (
            <div className="activity-body row" key={asset.id || asset.code}>
              <span className="accent-text">Asset</span>
              <span>{asset.name}</span>
              <span>{asset.category}</span>
              <span className="success-text">{asset.damaged ? 'Needs review' : asset.status}</span>
            </div>
          ))}
        </div>
      </AdminPanel>
    </>
  );
}