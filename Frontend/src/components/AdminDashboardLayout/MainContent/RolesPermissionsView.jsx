// RolesPermissionsView.jsx
import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import MutationSuccessModal from './MutationSuccessModal';

const RolesPermissionsView = () => {
  // 1. DYNAMIC CORE STATE DATA - Mapped perfectly to match your screenshot database collection state
  const [rolesCollections, setRolesCollections] = useState([
    {
      _id: '64f1a29b3a1a...',
      name: 'Admin',
      status: 'Active',
      permissions: ['run_payroll', 'manage_roles', 'audit_logs']
    },
    {
      _id: '64f1a29b3c4f...',
      name: 'HR',
      status: 'Active',
      permissions: ['manage_employees', 'approve_leaves', 'view_reports']
    },
    {
      _id: '64f1a29c1a7f...',
      name: 'Employee',
      status: 'Active',
      permissions: ['employee.view_self']
    }
  ]);

  // Comprehensive 11-row permutation checkbox collection matching your second screen captures
  const availablePermissions = [
    { label: 'Full access (* wildcard)', value: 'all' },
    { label: 'View employees', value: 'view_employees' },
    { label: 'Create employees', value: 'create_employees' },
    { label: 'Edit employees', value: 'edit_employees' },
    { label: 'Delete employees', value: 'delete_employees' },
    { label: 'View own profile', value: 'employee.view_self' },
    { label: 'Approve leaves', value: 'approve_leaves' },
    { label: 'View reports', value: 'view_reports' },
    { label: 'Run payroll', value: 'run_payroll' },
    { label: 'Manage roles', value: 'manage_roles' },
    { label: 'Audit logs', value: 'audit_logs' },
    { label: 'Manage employees', value: 'manage_employees' }
  ];

  // 2. ACTIVE ROW TRACKING & POPUP VISIBILITY STATES
  const [activeRoleName, setActiveRoleName] = useState('Employee');
  const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // Derives active dataset item configuration smoothly
  const activeRoleRecord = rolesCollections.find(role => role.name === activeRoleName) || rolesCollections[2];

  // 3. REACTIVE MUTATION ARRAY CONTROLLERS
  const handleTogglePermissionString = (permissionValue) => {
    setRolesCollections(prevList =>
      prevList.map(role => {
        if (role.name === activeRoleRecord.name) {
          const holdsTokenAlready = role.permissions.includes(permissionValue);
          const alteredTokens = holdsTokenAlready
            ? role.permissions.filter(p => p !== permissionValue)
            : [...role.permissions, permissionValue];
          
          return { ...role, permissions: alteredTokens };
        }
        return role;
      })
    );
  };

  const handleOpenMutationWizard = (e) => {
    e.preventDefault();
    setIsMutationModalOpen(true);
  };

  const handleExecuteDatabaseMutation = () => {
    setIsMutationModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className={styles.dashboardGrid}>
      
      {/* ── Main Splits Frame Container Layout (REMOVED REDUNDANT INNER HEADER BANNER) ── */}
      <div className={styles.chartsRow} style={{ alignItems: 'flex-start', gap: '24px', marginTop: '10px' }}>
        
        {/* LEFT CARD COLUMN: Active Database Collections Tracker Grid */}
        <div className={styles.chartContainer} style={{ flex: 1.5, minHeight: '520px' }}>
          <h3 style={{ marginBottom: '20px', color: '#0f172a', fontWeight: '700', fontSize: '1rem' }}>
            Active Database Collections
          </h3>
          
          <div className={styles.activityStream} style={{ boxShadow: 'none', padding: 0, border: 'none', marginTop: 0 }}>
            <table className={styles.activityTable} style={{ border: '1px solid #cbd5e1' }}>
              <thead>
                <tr>
                  <th style={{ color: '#475569', fontSize: '0.78rem', fontWeight: '600', width: '120px' }}>ROLE</th>
                  <th style={{ color: '#475569', fontSize: '0.78rem', fontWeight: '600', width: '100px' }}>STATUS</th>
                  <th style={{ color: '#475569', fontSize: '0.78rem', fontWeight: '600' }}>PERMISSIONS</th>
                </tr>
              </thead>
              <tbody>
                {rolesCollections.map((role) => {
                  const isSelectedRow = role.name === activeRoleRecord.name;
                  
                  return (
                    <tr 
                      key={role.name} 
                      onClick={() => setActiveRoleName(role.name)}
                      style={{ 
                        cursor: 'pointer', 
                        backgroundColor: isSelectedRow ? '#f1f5f9' : '#f8fafc',
                        borderBottom: '2px solid #0f172a'
                      }}
                    >
                      <td style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: '500', padding: '20px 16px' }}>
                        {role.name}
                      </td>
                      <td>
                        <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '0.8rem' }}>
                          {role.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 0' }}>
                          {role.permissions.map((perm) => (
                            <span 
                              key={perm} 
                              style={{ 
                                fontSize: '0.82rem', 
                                color: '#4f46e5', 
                                fontWeight: '600', 
                                fontFamily: 'monospace' 
                              }}
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT CARD COLUMN: Schema Mutation Inspector Active Form Control */}
        <div className={styles.chartContainer} style={{ flex: 1, minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>
            Schema Mutation Inspector
          </h3>
          
          <form onSubmit={handleOpenMutationWizard} style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Role Selector Dropdown Input Block */}
              <div className={styles.inputGroup} style={{ width: '100%' }}>
                <label style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '600', marginBottom: '6px' }}>
                  Role selector
                </label>
                <select 
                  value={activeRoleName}
                  onChange={(e) => setActiveRoleName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: '500', background: '#ffffff', outline: 'none' }}
                >
                  {rolesCollections.map(r => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* Selected Permissions Tracker Value String Output Block */}
              <div>
                <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: '600', display: 'block', marginBottom: '6px' }}>
                  Selected permissions
                </span>
                <div style={{ color: '#64748b', fontSize: '0.9rem', fontFamily: 'monospace', minHeight: '24px' }}>
                  {activeRoleRecord.permissions.join(', ') || 'none'}
                </div>
              </div>

              {/* Informative Helper Alert Label Matrix */}
              <div style={{ fontSize: '0.82rem', color: '#064e3b', fontWeight: '600', background: 'transparent', lineHeight: '1.4' }}>
                Loaded default Admin, HR, and Employee roles.
              </div>

              {/* Checkbox Permission Tree List Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block', marginBottom: '2px' }}>
                  Mutate permissions String Array
                </span>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '310px', overflowY: 'auto', paddingRight: '4px' }}>
                  {availablePermissions.map((item) => {
                    const isChecked = activeRoleRecord.permissions.includes(item.value);
                    return (
                      <label 
                        key={item.value}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px', 
                          cursor: 'pointer',
                          fontSize: '0.88rem', 
                          fontWeight: isChecked ? '700' : '500', 
                          color: '#0f172a' 
                        }}
                      >
                        <input 
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTogglePermissionString(item.value)}
                          style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                        />
                        <span>{item.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Save Action Submit Button Element Container block */}
            <button 
              type="submit" 
              className={styles.primaryActionButton}
              style={{ width: '100%', padding: '12px', backgroundColor: '#2563eb', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '600', color: '#ffffff', border: 'none', cursor: 'pointer', marginTop: '24px' }}
            >
              Save Permissions
            </button>
          </form>
        </div>

      </div>

      {/* ── JSON PAYLOAD OVERRIDE OVERLAY CONFIRMATION STAGING MODAL ── */}
      {isMutationModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsMutationModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px', borderRadius: '12px' }}>
            <div className={styles.modalHeader} style={{ padding: '0 0 14px 0', marginBottom: '14px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Confirm Schema Mutation</h2>
              <button className={styles.modalCloseBtn} onClick={() => setIsMutationModalOpen(false)}>&times;</button>
            </div>

            <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              You are executing a role permission array schema override mutation for collection <strong>{activeRoleRecord.name}</strong>.
            </p>

            <div style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.82rem', lineHeight: '1.6', overflowX: 'auto' }}>
              <span style={{ color: '#e2e8f0' }}>{`{`}</span> <br />
              &nbsp;&nbsp;<span style={{ color: '#f43f5e' }}>"collection"</span>: <span style={{ color: '#a7f3d0' }}>"{activeRoleRecord.name}"</span>,<br />
              &nbsp;&nbsp;<span style={{ color: '#f43f5e' }}>"$set"</span>: <span style={{ color: '#e2e8f0' }}>{`{`}</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>"permissions"</span>: [<br />
              {activeRoleRecord.permissions.map((p, idx) => (
                <div key={p}>
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#fbcfe8' }}>"{p}"</span>
                  {idx < activeRoleRecord.permissions.length - 1 ? <span style={{ color: '#e2e8f0' }}>,</span> : ''}
                </div>
              ))}
              &nbsp;&nbsp;&nbsp;&nbsp;]<br />
              &nbsp;&nbsp;<span style={{ color: '#e2e8f0' }}>{`}`}</span><br />
              <span style={{ color: '#e2e8f0' }}>{`}`}</span>
            </div>

            <div className={styles.modalActionButtons} style={{ marginTop: '20px', padding: '14px 0 0 0' }}>
              <button type="button" className={styles.btnCancel} onClick={() => setIsMutationModalOpen(false)}>Abort</button>
              <button 
                type="button" 
                className={styles.btnSubmit} 
                onClick={handleExecuteDatabaseMutation}
                style={{ backgroundColor: '#2563eb', padding: '10px 20px', color: '#ffffff', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
              >
                Commit Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── IN-APP REACTION SUCCESS NOTIFICATION POPUP MOUNT ── */}
      <MutationSuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        collectionName={activeRoleRecord.name}
      />

    </div>
  );
};

export default RolesPermissionsView;