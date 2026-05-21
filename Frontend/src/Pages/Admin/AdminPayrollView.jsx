import React from 'react';
import { adminPayrollRows } from './adminDashboardData';
import { AdminDashboardStatCard, AdminPanel } from './AdminDashboardShared';

export default function AdminPayrollView() {
  return (
    <>
      <div className="stat-grid attendance-grid">
        <AdminDashboardStatCard label="TOTAL DISBURSED (MONTHLY)" value="₹12,45,000.00" />
        <AdminDashboardStatCard label="PENDING REGULATORY PF" value="₹1,18,400.00" note="Due" accent="warning" />
        <article className="stat-card stat-card-action">
          <button className="main-btn inline-btn">Execute Run</button>
        </article>
      </div>

      <AdminPanel title="Payroll Disbursement Ledger">
        <div className="payroll-table">
          <div className="payroll-head row">
            <span>Employee</span>
            <span>Base Salary</span>
            <span>Net Payout (₹)</span>
            <span>Status</span>
            <span>Payslip PDF</span>
          </div>
          {adminPayrollRows.map((row) => (
            <div className="payroll-body row" key={row.name}>
              <div>
                <div className="strong">{row.name}</div>
                <div className="subtle">{row.department}</div>
              </div>
              <span>{row.base}</span>
              <span className="strong">{row.net}</span>
              <span><span className="badge success">{row.status}</span></span>
              <button className="ghost-btn">Download</button>
            </div>
          ))}
        </div>
      </AdminPanel>
    </>
  );
}