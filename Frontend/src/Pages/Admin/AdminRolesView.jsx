import React from 'react';
import { adminRoleRows } from './adminDashboardData';
import { AdminPanel } from './AdminDashboardShared';

export default function AdminRolesView() {
  return (
    <div className="roles-layout">
      <AdminPanel title="Active Database Collections" className="roles-panel">
        <div className="role-table">
          <div className="role-head row">
            <span>_id Object</span>
            <span>name Stack</span>
            <span>permissions Enum Mapping</span>
          </div>
          {adminRoleRows.map((role) => (
            <div className={`role-row row ${role.selected ? 'selected' : ''}`} key={role.id}>
              <span className="mono">{role.id}</span>
              <span>
                <span className="role-pill">{role.name}</span>
              </span>
              <span className="role-permissions">
                {role.permissions.map((permission) => (
                  <span className="mini-pill" key={permission}>{permission}</span>
                ))}
              </span>
            </div>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title="Schema Mutation Inspector" className="roles-panel inspector-panel">
        <div className="form-block">
          <label>Collection Target name</label>
          <input type="text" readOnly value="HR" />
        </div>

        <div className="permission-list">
          <p className="muted-label">Mutate permissions String Array</p>
          {['manage_employees', 'approve_leaves', 'view_reports', 'run_payroll'].map((permission, index) => (
            <label className="permission-item" key={permission}>
              <input type="checkbox" defaultChecked={index < 3} />
              <span>{permission}</span>
            </label>
          ))}
        </div>

        <button className="main-btn">Push Document Update</button>
      </AdminPanel>
    </div>
  );
}