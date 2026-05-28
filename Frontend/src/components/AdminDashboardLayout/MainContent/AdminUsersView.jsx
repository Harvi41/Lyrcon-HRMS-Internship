// AdminUsersView.jsx
import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import { createDashboardUser } from '../../../lib/axios';

const AdminUsersView = () => {
  // 1. READ-ONLY ROLE PERMISSIONS OVERVIEW MATRIX (Left Side Panel)
  const provisionedRoles = [
    {
      role: 'Admin',
      permissions: ['run_payroll', 'manage_roles', 'audit_logs']
    },
    {
      role: 'HR',
      permissions: ['manage_employees', 'approve_leaves', 'view_reports']
    },
    {
      role: 'Employee',
      permissions: ['employee.view_self']
    }
  ];

  // 2. FORM INTERACTIVE CONTROL STATES (Right Side Panel)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Admin'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Automatically fetch active display strings for role permissions based on selector state
  const activePermissionsPreview = provisionedRoles.find(
    (item) => item.role.toLowerCase() === formData.role.toLowerCase()
  )?.permissions.join(', ') || '';

  const handleCreateAccountSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        roleName: formData.role
      };

      await createDashboardUser(payload);
      
      setMessage(`Account provisioned successfully for ${formData.fullName} as [${formData.role}]!`);
      
      // Reset fields after registration success
      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'Admin'
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.dashboardGrid}>
      
      {/* ── Core Splits Frame Columns Area ── */}
      <div className={styles.chartsRow} style={{ alignItems: 'flex-start', gap: '24px', marginTop: '10px' }}>
        
        {/* LEFT COLUMN PANEL: Provisioned Roles Matrix Card */}
        <div className={styles.chartContainer} style={{ flex: 1.2 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
            Provisioned Roles
          </h3>

          <table className={styles.activityTable} style={{ border: '1px solid #cbd5e1', tableLayout: 'fixed' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ color: '#475569', fontSize: '0.78rem', fontWeight: '600', width: '120px', padding: '12px 16px' }}>ROLE</th>
                <th style={{ color: '#475569', fontSize: '0.78rem', fontWeight: '600', padding: '12px 16px' }}>PERMISSIONS</th>
              </tr>
            </thead>
            <tbody>
              {provisionedRoles.map((item) => (
                <tr key={item.role} style={{ borderBottom: '2px solid #0f172a', backgroundColor: '#f8fafc' }}>
                  <td style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: '500', padding: '24px 16px', verticalAlign: 'top' }}>
                    {item.role}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {item.permissions.map((perm) => (
                        <span key={perm} style={{ fontSize: '0.82rem', color: '#4f46e5', fontWeight: '600', fontFamily: 'monospace' }}>
                          {perm}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RIGHT COLUMN PANEL: Account Processing Creation Form */}
        <div className={styles.chartContainer} style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '20px' }}>
            Create Dashboard Account
          </h3>

          {error && <div style={{ color: '#dc2626', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '500' }}>{error}</div>}
          {message && <div style={{ color: '#16a34a', marginBottom: '16px', fontSize: '0.85rem', fontWeight: '500' }}>{message}</div>}

          <form onSubmit={handleCreateAccountSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Inline Full Name & Email Form inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#1e293b', marginBottom: '6px', fontSize: '0.8rem', fontWeight: '600' }}>Full name</label>
                <input 
                  type="text"
                  name="fullName"
                  placeholder="Jane Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required /* FIXED: Automatically prompts native bubble if left empty */
                  style={{ padding: '10px 12px', border: '1px solid #4f46e5', borderRadius: '6px', fontSize: '0.95rem', color: '#334155', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#1e293b', marginBottom: '6px', fontSize: '0.8rem', fontWeight: '600' }}>Email</label>
                <input 
                  type="email"
                  name="email"
                  placeholder="jane@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required /* FIXED: Enforces correct mail format string checking */
                  style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', color: '#334155', outline: 'none' }}
                />
              </div>
            </div>

            {/* Inline Password & Role Selector options row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#1e293b', marginBottom: '6px', fontSize: '0.8rem', fontWeight: '600' }}>Password</label>
                <input 
                  type="password"
                  name="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={handleInputChange}
                  required /* FIXED: Prevents account creation bypasses */
                  style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ color: '#1e293b', marginBottom: '6px', fontSize: '0.8rem', fontWeight: '600' }}>Role</label>
                <select 
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.95rem', background: '#ffffff', cursor: 'pointer', outline: 'none' }}
                >
                  <option value="Admin">Admin</option>
                  <option value="HR">HR</option>
                  <option value="Employee">Employee</option>
                </select>
              </div>
            </div>

            {/* Sub-permissions String Array Trace Tracker Preview Text Box */}
            <div style={{ marginTop: '4px' }}>
              <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '700', display: 'block', marginBottom: '6px' }}>
                Role permissions
              </span>
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontFamily: 'monospace', minHeight: '20px' }}>
                {activePermissionsPreview}
              </div>
            </div>

            {/* Submit Control Action Button */}
            <button 
              type="submit"
              className={styles.primaryActionButton}
              style={{ width: '100%', padding: '12px', background: '#4f46e5', color: '#ffffff', fontWeight: '600', fontSize: '0.9rem', border: 'none', borderRadius: '8px', cursor: 'pointer', marginTop: '10px' }}
            >
              Create Account
            </button>

          </form>
        </div>

      </div>

    </div>
  );
};

export default AdminUsersView;