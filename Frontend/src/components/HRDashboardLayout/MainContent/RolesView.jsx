import React, { useEffect, useMemo, useState } from 'react';
import styles from '../HRDashboardLayout.module.css';
import API from '../../../lib/axios';

const ALL_PERMISSIONS = [
  'manage_employees',
  'approve_leaves',
  'view_reports',
  'run_payroll',
  'manage_assets',
  'manage_users',
];

const RolesView = () => {
  const [rolesList, setRolesList] = useState([]);
  const [selectedRole, setSelectedRole] = useState('HR');
  const [permissions, setPermissions] = useState([]);
  const [customPermission, setCustomPermission] = useState('');
  const [customRoleName, setCustomRoleName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchRoles = async () => {
      setLoading(true);
      try {
        const res = await API.get('/roles');
        const items = res.data?.roles || [];
        if (!mounted) return;
        setRolesList(items);
        // select HR if exists, otherwise first role
        const hrRole = items.find((r) => String(r.name).toLowerCase() === 'hr');
        const first = hrRole ? hrRole.name : (items[0]?.name || 'HR');
        setSelectedRole(first);
        const initial = (hrRole || items[0])?.permissions || [];
        setPermissions(initial);
      } catch (err) {
        console.warn('Failed to fetch roles', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
    return () => { mounted = false; };
  }, []);

  const isPermissionChecked = (perm) => permissions.includes(perm);

  const togglePermission = (perm) => {
    setPermissions((prev) => {
      if (prev.includes(perm)) return prev.filter((p) => p !== perm);
      return [...prev, perm];
    });
  };

  const addCustomPermission = () => {
    const p = customPermission.trim();
    if (!p) return;
    if (!permissions.includes(p)) setPermissions((prev) => [...prev, p]);
    setCustomPermission('');
  };

  const handlePush = async () => {
    const payload = {
      role: selectedRole === 'Custom' ? 'custom' : selectedRole,
      permissions,
    };
    if (selectedRole === 'Custom' && customRoleName.trim()) payload.customName = customRoleName.trim();

    try {
      const res = await API.post('/roles/update', payload);
      if (res?.status === 200) {
        alert('Role permissions updated successfully');
        // refresh roles list
        const listRes = await API.get('/roles');
        setRolesList(listRes.data?.roles || []);
      } else {
        alert('Update attempted — check console for details.');
      }
    } catch (err) {
      console.error('roles update error', err);
      alert('Failed to update — check console for details.');
    }
  };

  const permissionItems = useMemo(() => {
    const extras = permissions.filter((p) => !ALL_PERMISSIONS.includes(p));
    return [...ALL_PERMISSIONS, ...extras];
  }, [permissions]);

  return (
    <div className={styles.chartsRow}>
      <div className={styles.chartContainer}>
        <h3>Active Database Collections</h3>
        <table className={styles.activityTable}>
          <thead>
            <tr>
              <th>_id OBJECT</th>
              <th>name STACK</th>
              <th>permissions ENUM MAPPING</th>
            </tr>
          </thead>
          <tbody>
            {rolesList.map((r) => (
              <tr key={r._id} onClick={() => {
                setSelectedRole(r.name);
                setPermissions(r.permissions || []);
              }} style={{ cursor: 'pointer' }}>
                <td className={styles.subTextEmail}>{String(r._id).slice(0, 10)}...</td>
                <td>
                  <span className={styles.badgeLabelPurple}>{r.name}</span>
                </td>
                <td>
                  <div className={styles.tagFlexContainer}>
                    {(r.permissions || []).map((p) => (
                      <span className={styles.miniTag} key={p}>{`"${p}"`}</span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mutation Right Sidebar Inspector panel field */}
      <div className={styles.chartContainer}>
        <h3>Schema Mutation Inspector</h3>
        <div className={styles.inspectorWrapper}>
          <div className={styles.inputGroup}>
            <label>Collection Target name</label>
            <select
              value={selectedRole}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedRole(val);
                const found = rolesList.find((x) => x.name === val);
                setPermissions(found ? (found.permissions || []) : []);
              }}
              className={styles.inspectorInputRead}
            >
              {rolesList.map((r) => (
                <option key={r._id} value={r.name}>{r.name}</option>
              ))}
              <option value="Custom">Custom</option>
            </select>
          </div>

          <div className={styles.checkboxControlGroup}>
            <label className={styles.groupLabel}>Mutate permissions String Array</label>
            {permissionItems.map((perm) => (
              <label className={styles.checkLabel} key={perm}>
                <input
                  type="checkbox"
                  checked={isPermissionChecked(perm)}
                  onChange={() => togglePermission(perm)}
                />
                {` "${perm}"`}
              </label>
            ))}
          </div>

          <div className={styles.inputGroup} style={{ marginTop: 12 }}>
            <label>Add custom permission</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={customPermission}
                onChange={(e) => setCustomPermission(e.target.value)}
                className={styles.inspectorInputRead}
                placeholder="e.g. manage_contracts"
              />
              <button onClick={addCustomPermission} className={styles.primaryActionButtonWidth}>
                Add
              </button>
            </div>
          </div>

          {selectedRole === 'Custom' && (
            <div className={styles.inputGroup} style={{ marginTop: 12 }}>
              <label>Custom role name</label>
              <input
                type="text"
                value={customRoleName}
                onChange={(e) => setCustomRoleName(e.target.value)}
                className={styles.inspectorInputRead}
                placeholder="e.g. Contractor"
              />
            </div>
          )}

          <div style={{ marginTop: 14 }}>
            <button onClick={handlePush} className={styles.primaryActionButtonWidth}>
              Push Document Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesView;