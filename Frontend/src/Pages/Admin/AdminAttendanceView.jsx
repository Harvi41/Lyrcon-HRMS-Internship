import React from 'react';
import { AdminDashboardStatCard, AdminPanel, AdminTrendLineChart } from './AdminDashboardShared';

export default function AdminAttendanceView({ summary, userName }) {
  return (
    <>
      <div className="stat-grid attendance-grid">
        <AdminDashboardStatCard label="MONTHLY AVG PRESENT RATE" value={`${summary.activeWorkforceRate || 0}%`} />
        <AdminDashboardStatCard label="AVG CLOCK-IN TIME" value="09:04 AM" />
        <AdminDashboardStatCard label="TOTAL LEAKAGE HOURS" value={`${summary.damagedAssets || 0}.0 hrs`} note="Alert" accent="danger" />
      </div>

      <div className="dashboard-grid">
        <AdminPanel title="Monthly Turnout Graph (30-Day Trend View)">
          <AdminTrendLineChart />
        </AdminPanel>
      </div>

      <AdminPanel title="Shift Validation Overview">
        <div className="attendance-table">
          <div className="attendance-head row">
            <span>Employee</span>
            <span>Shift Stamp</span>
            <span>Compliance Metric</span>
            <span>Overtime Detect</span>
          </div>
          <div className="attendance-body row">
            <span className="strong">{userName}</span>
            <span>09:00 AM - 06:00 PM</span>
            <span><span className="badge success">Perfect</span></span>
            <span>0.0 hrs</span>
          </div>
        </div>
      </AdminPanel>
    </>
  );
}