import React from 'react';
import { adminDepartmentData } from './adminDashboardData';
import { AdminPanel } from './AdminDashboardShared';

export default function AdminEmployeesView({ summary }) {
  const departmentSeries = summary.departmentBreakdown.length > 0 ? summary.departmentBreakdown : adminDepartmentData;

  return (
    <AdminPanel title="Employee Registry">
      <div className="settings-grid">
        <div>
          <p className="muted-label">Total Active Employees</p>
          <p className="strong">{summary.activeEmployees || 0}</p>
        </div>
        <div>
          <p className="muted-label">Open Requisitions</p>
          <p className="strong">{summary.pendingActions || 0}</p>
        </div>
        <div>
          <p className="muted-label">Assets Managed</p>
          <p className="strong">{summary.assetTotal || 0}</p>
        </div>
        <div>
          <p className="muted-label">Departments</p>
          <p className="strong">{departmentSeries.length || 0}</p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '20px' }}>
        <div className="activity-head row">
          <span>Name</span>
          <span>Email</span>
          <span>Department</span>
          <span>Status</span>
        </div>
        {summary.recentEmployees.map((employee) => (
          <div className="activity-body row" key={employee.id || employee.email}>
            <span className="strong">{employee.name}</span>
            <span>{employee.email}</span>
            <span>{employee.department}</span>
            <span className="success-text">{employee.status}</span>
          </div>
        ))}
      </div>
    </AdminPanel>
  );
}