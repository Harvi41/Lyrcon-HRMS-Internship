import React from 'react';
import { adminLeaveBreakdown } from './adminDashboardData';
import { AdminPanel } from './AdminDashboardShared';

export default function AdminLeaveView({ summary }) {
  return (
    <>
      <div className="dashboard-grid split-grid">
        <AdminPanel title="Monthly Leave Class Proportions">
          <div className="leave-list">
            {adminLeaveBreakdown.map((item) => (
              <div className="leave-row" key={item.label}>
                <span className="leave-label">{item.label}</span>
                <div className="department-track">
                  <div className={`department-fill ${item.tone}`} style={{ width: `${item.width}px` }} />
                </div>
                <strong className="department-value">{item.value}%</strong>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Operational Balance Metrics">
          <p className="muted-label">Active Absences (Today)</p>
          <div className="leave-hero">{summary.inactiveEmployees || 0} Employees</div>
          <p className="success-copy">✓ Staffing limits within safe thresholds ({summary.activeWorkforceRate || 0}% available)</p>
        </AdminPanel>
      </div>

      <AdminPanel title="Leave Approval Queue">
        <div className="leave-table">
          <div className="leave-head row">
            <span>Employee</span>
            <span>Classification</span>
            <span>Chrono Range</span>
            <span>Status Validation</span>
            <span>Governance</span>
          </div>
          <div className="leave-body row">
            <span className="strong">Sarah Jenkins</span>
            <span>Sick Leave (SL)</span>
            <span>Oct 24 - Oct 25</span>
            <span><span className="badge warning">Pending</span></span>
            <button className="ghost-btn">Approve</button>
          </div>
        </div>
      </AdminPanel>
    </>
  );
}