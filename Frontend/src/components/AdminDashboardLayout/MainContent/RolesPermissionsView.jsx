import React, { useState } from 'react';
import styles from '../AdminDashboardLayout.module.css';
import MutationSuccessModal from './MutationSuccessModal'; // Import the new third popup module

const RolesPermissionsView = () => {
  // 1. DYNAMIC CORE STATE DATA
  const [rolesCollections, setRolesCollections] = useState([
    {
      _id: '64f1a29b3c...',
      name: 'HR',
      permissions: ['manage_employees', 'approve_leaves', 'view_reports']
    },
    {
      _id: '64f1a29b7f...',
      name: 'Engineering',
      permissions: ['view_reports']
    },
    {
      _id: '64f1a29c1a...',
      name: 'Finance',
      permissions: ['view_reports', 'run_payroll']
    }
  ]);

  const availablePermissions = [
    'manage_employees',
    'approve_leaves',
    'view_reports',
    'run_payroll'
  ];

  // 2. ACTIVE ROW TRACKING & POPUP VISIBILITY STATES
  const [activeRoleName, setActiveRoleName] = useState('HR');
  const [isMutationModalOpen, setIsMutationModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // Third popup state toggle

  // Derives the currently selected database profile row automatically from state parameters
  const activeRoleRecord = rolesCollections.find(role => role.name === activeRoleName) || rolesCollections[0];

  // 3. REACTIVE MUTATION ARRAY CONTROLLERS
  const handleTogglePermissionString = (permissionToken) => {
    setRolesCollections(prevList =>
      prevList.map(role => {
        if (role.name === activeRoleRecord.name) {
          const holdsTokenAlready = role.permissions.includes(permissionToken);
          const alteredTokens = holdsTokenAlready
            ? role.permissions.filter(p => p !== permissionToken)
            : [...role.permissions, permissionToken];
          
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

  // Step 2 to Step 3 Sequential Modal Handshake Link
  const handleExecuteDatabaseMutation = () => {
    setIsMutationModalOpen(false); // Close staging review panel
    setIsSuccessModalOpen(true);    // Instantly cascade open the new custom success notification
  };

  return (
    <div className={styles.dashboardGrid}>
      
      {/* Main Splits Frame Container Layout */}
      <div className={styles.chartsRow} style={{ marginTop: '10px', alignItems: 'flex-start', gap: '24px' }}>
        
        {/* LEFT CARD COLUMN: Active Database Collections Tracker Grid */}
        <div className={styles.chartContainer} style={{ flex: 1.6, minHeight: '520px' }}>
          <h3 style={{ marginBottom: '20px', color: '#0f172a', fontWeight: '600' }}>Active Database Collections</h3>
          
          <div className={styles.activityStream} style={{ boxShadow: 'none', padding: 0, border: 'none', marginTop: 0 }}>
            <table className={styles.activityTable}>
              <thead>
                <tr>
                  <th style={{ color: '#64748b', fontSize: '0.8rem', letterSpacing: '0.02em' }}>_id OBJECT</th>
                  <th style={{ color: '#64748b', fontSize: '0.8rem', letterSpacing: '0.02em' }}>name STACK</th>
                  <th style={{ color: '#64748b', fontSize: '0.8rem', letterSpacing: '0.02em' }}>permissions ENUM MAPPING</th>
                  <th style={{ color: '#4f46e5', fontSize: '0.8rem', textAlign: 'right' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {rolesCollections.map((role) => {
                  const isSelectedRow = role.name === activeRoleRecord.name;
                  
                  return (
                    <tr 
                      key={role._id} 
                      onClick={() => setActiveRoleName(role.name)}
                      style={{ 
                        cursor: 'pointer', 
                        backgroundColor: isSelectedRow ? '#f8fafc' : 'transparent',
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <td style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.85rem' }}>{role._id}</td>
                      <td>
                        <span className={styles.statusLabel} style={{ backgroundColor: '#e0e7ff', color: '#4f46e5', fontWeight: '700', padding: '4px 12px' }}>
                          {role.name}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {role.permissions.map((perm) => (
                            <span 
                              key={perm} 
                              className={styles.statusLabel}
                              style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0', fontFamily: 'monospace' }}
                            >
                              "{perm}"
                            </span>
                          ))}
                          {role.permissions.length === 0 && (
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic', paddingLeft: '4px' }}>[] empty string array</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isSelectedRow ? (
                          <strong style={{ color: '#4f46e5', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Selected</strong>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Inspect</span>
                        )}
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
          <h3>Schema Mutation Inspector</h3>
          
          <form onSubmit={handleOpenMutationWizard} style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', marginTop: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className={styles.inputGroup} style={{ width: '100%' }}>
                <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '8px', display: 'block' }}>
                  Collection Target name
                </label>
                <input 
                  type="text" 
                  value={`"${activeRoleRecord.name}"`}
                  style={{ 
                    width: '100%', padding: '12px 14px', borderRadius: '8px', border: '2px solid #4f46e5', 
                    backgroundColor: '#ffffff', color: '#0f172a', fontWeight: '700', fontSize: '1rem', letterSpacing: '0.02em'
                  }}
                  readOnly 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
                <label style={{ fontSize: '0.85rem', color: '#475569', fontWeight: '600', marginBottom: '2px', display: 'block' }}>
                  Mutate permissions String Array
                </label>
                
                {availablePermissions.map((permissionToken) => {
                  const hasTokenAttached = activeRoleRecord.permissions.includes(permissionToken);
                  
                  return (
                    <label 
                      key={permissionToken} 
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', 
                        fontSize: '0.9rem', fontWeight: '600', color: hasTokenAttached ? '#0f172a' : '#94a3b8',
                        transition: 'color 0.2s ease', fontFamily: 'monospace'
                      }}
                    >
                      <input 
                        type="checkbox" checked={hasTokenAttached}
                        onChange={() => handleTogglePermissionString(permissionToken)}
                        style={{ width: '18px', height: '18px', accentColor: '#4f46e5', cursor: 'pointer', borderRadius: '4px' }}
                      />
                      <span>"{permissionToken}"</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <button 
              type="submit" className={styles.primaryActionButton}
              style={{ width: '100%', padding: '14px', backgroundColor: '#4f46e5', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '600', letterSpacing: '0.02em', marginTop: '40px' }}
            >
              Push Document Update
            </button>
          </form>
        </div>

      </div>

      {/* ── SECOND POPUP: JSON PAYLOAD CONFIRMATION STAGING MODAL ── */}
      {isMutationModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsMutationModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className={styles.modalHeader}>
              <h2>Confirm Schema Mutation</h2>
              <button className={styles.modalCloseBtn} onClick={() => setIsMutationModalOpen(false)}>&times;</button>
            </div>

            <div style={{ padding: '10px 0' }}>
              <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 14px 0', lineHeight: '1.5' }}>
                You are executing a role permission array schema override mutation. This directly impacts baseline authentication endpoints.
              </p>

              <div style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: '16px', borderRadius: '10px', fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.6', overflowX: 'auto', border: '1px solid #334155' }}>
                <div style={{ color: '#64748b', marginBottom: '4px' }}>// Proposed MongoDB Update Payload</div>
                <span style={{ color: '#e2e8f0' }}>{`{`}</span> <br />
                &nbsp;&nbsp;<span style={{ color: '#f43f5e' }}>"_id"</span><span style={{ color: '#e2e8f0' }}>:</span> <span style={{ color: '#a7f3d0' }}>"{activeRoleRecord._id}"</span><span style={{ color: '#e2e8f0' }}>,</span><br />
                &nbsp;&nbsp;<span style={{ color: '#f43f5e' }}>"collection"</span><span style={{ color: '#e2e8f0' }}>:</span> <span style={{ color: '#a7f3d0' }}>"{activeRoleRecord.name}"</span><span style={{ color: '#e2e8f0' }}>,</span><br />
                &nbsp;&nbsp;<span style={{ color: '#f43f5e' }}>"$set"</span><span style={{ color: '#e2e8f0' }}>: {`{`}</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#38bdf8' }}>"permissions"</span><span style={{ color: '#e2e8f0' }}>: [</span><br />
                {activeRoleRecord.permissions.map((p, idx) => (
                  <div key={p}>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#fbcfe8' }}>"{p}"</span>
                    {idx < activeRoleRecord.permissions.length - 1 ? <span style={{ color: '#e2e8f0' }}>,</span> : ''}
                  </div>
                ))}
                &nbsp;&nbsp;&nbsp;&nbsp;<span style={{ color: '#e2e8f0' }}>]</span><br />
                &nbsp;&nbsp;<span style={{ color: '#e2e8f0' }}>{`}`}</span><br />
                <span style={{ color: '#e2e8f0' }}>{`}`}</span>
              </div>
            </div>

            <div className={styles.modalActionButtons} style={{ marginTop: '16px' }}>
              <button type="button" className={styles.secondaryActionButton} onClick={() => setIsMutationModalOpen(false)}>Abort</button>
              <button 
                type="button" className={styles.primaryActionButton} onClick={handleExecuteDatabaseMutation}
                style={{ backgroundColor: '#4f46e5', padding: '10px 24px', borderRadius: '10px' }}
              >
                Commit Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── THIRD POPUP: IN-APP REACTION SUCCESS NOTIFICATION ── */}
      <MutationSuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        collectionName={activeRoleRecord.name}
      />

    </div>
  );
};

export default RolesPermissionsView;