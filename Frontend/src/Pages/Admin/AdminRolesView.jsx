import React, { useEffect, useMemo, useState } from 'react';
import { getRoles, updateRolePermissions } from '../../lib/axios';
import { adminPermissionCatalog, adminRoleRows } from './adminDashboardData';
import { AdminPanel } from './AdminDashboardShared';

const FALLBACK_ROLES = adminRoleRows;
const DEFAULT_ROLE_ORDER = ['admin', 'hr', 'employee'];

const getRoleKey = (role) => String(role?.name || '').trim().toLowerCase();

const getFallbackRole = (roleKey) => FALLBACK_ROLES.find((role) => getRoleKey(role) === roleKey) || null;
const isDefaultRoleKey = (roleKey) => DEFAULT_ROLE_ORDER.includes(roleKey);

export default function AdminRolesView() {
  const [roles, setRoles] = useState(FALLBACK_ROLES);
  const [selectedRoleName, setSelectedRoleName] = useState('admin');
  const [customRoleName, setCustomRoleName] = useState('');
  const [draftPermissions, setDraftPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedRole = useMemo(
    () => roles.find((role) => getRoleKey(role) === selectedRoleName) || null,
    [roles, selectedRoleName],
  );

  const roleOptions = useMemo(() => {
    const orderedRoles = [...roles].sort((left, right) => {
      const leftKey = getRoleKey(left);
      const rightKey = getRoleKey(right);
      const leftIndex = DEFAULT_ROLE_ORDER.indexOf(leftKey);
      const rightIndex = DEFAULT_ROLE_ORDER.indexOf(rightKey);

      if (leftIndex !== -1 || rightIndex !== -1) {
        if (leftIndex === -1) return 1;
        if (rightIndex === -1) return -1;
        return leftIndex - rightIndex;
      }

      return left.name.localeCompare(right.name);
    });

    return orderedRoles;
  }, [roles]);

  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await getRoles();
        const apiRoles = Array.isArray(data?.roles) ? data.roles : [];
        const mergedRoles = DEFAULT_ROLE_ORDER.map((expectedRole) => {
          const matchedApiRole = apiRoles.find((role) => getRoleKey(role) === expectedRole);

          if (matchedApiRole) {
            return matchedApiRole;
          }

          return getFallbackRole(expectedRole);
        }).filter(Boolean);

        const customRoles = apiRoles.filter((role) => !isDefaultRoleKey(getRoleKey(role)));
        const combinedRoles = [...mergedRoles, ...customRoles];

        if (combinedRoles.length > 0) {
          setRoles(combinedRoles);
          const firstRole = combinedRoles[0];
          setSelectedRoleName(getRoleKey(firstRole));
          setCustomRoleName('');
          setDraftPermissions([...(firstRole.permissions || [])]);
          setMessage(apiRoles.length > 0 ? '' : 'Loaded default Admin, HR, and Employee roles.');
          return;
        }

        setRoles(FALLBACK_ROLES);
        setSelectedRoleName('admin');
        setCustomRoleName('');
        setDraftPermissions([...(FALLBACK_ROLES[0]?.permissions || [])]);
        setMessage('Loaded default Admin, HR, and Employee roles.');
      } catch (loadError) {
        setRoles(FALLBACK_ROLES);
        setSelectedRoleName('admin');
        setCustomRoleName('');
        setDraftPermissions([...(FALLBACK_ROLES[0]?.permissions || [])]);
        setMessage('Loaded default Admin, HR, and Employee roles.');
        setError(loadError?.response?.data?.message || '');
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  useEffect(() => {
    if (selectedRole) {
      setDraftPermissions([...(selectedRole.permissions || [])]);
      setCustomRoleName('');
      return;
    }

    if (selectedRoleName === 'custom') {
      setDraftPermissions([]);
    }
  }, [selectedRole, selectedRoleName]);

  const togglePermission = (permission) => {
    setDraftPermissions((current) => {
      if (current.includes(permission)) {
        return current.filter((item) => item !== permission);
      }

      return [...current, permission];
    });
  };

  const handleSave = async () => {
    if (!selectedRole) {
      if (selectedRoleName !== 'custom') {
        return;
      }
    }

    if (selectedRoleName === 'custom' && !customRoleName.trim()) {
      setError('Enter a custom role name before saving.');
      return;
    }

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const payload = {
        role: selectedRoleName === 'custom' ? 'custom' : (selectedRole?.name || 'Employee'),
        permissions: draftPermissions,
      };

      if (selectedRoleName === 'custom' && customRoleName.trim()) {
        payload.customName = customRoleName.trim();
      }

      const { data } = await updateRolePermissions(payload);
      const updatedRole = data?.role;

      if (updatedRole) {
        setRoles((current) => {
          const updatedRoleKey = getRoleKey(updatedRole);
          const existingIndex = current.findIndex((role) => getRoleKey(role) === updatedRoleKey);

          if (existingIndex === -1) {
            return [...current, updatedRole];
          }

          return current.map((role) => {
            if (getRoleKey(role) === updatedRoleKey) {
              return updatedRole;
            }

            return role;
          });
        });

        setSelectedRoleName(getRoleKey(updatedRole));
        setCustomRoleName('');
        setDraftPermissions([...(updatedRole.permissions || draftPermissions)]);
      }

      setMessage(`${selectedRole?.name || customRoleName || 'Custom role'} permissions updated successfully.`);
    } catch (saveError) {
      setError(saveError?.response?.data?.message || 'Unable to update role permissions.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="roles-layout">
      <AdminPanel title="Active Database Collections" className="roles-panel">
        <div className="role-table">
          <div className="role-head row">
            <span>Role</span>
            <span>Status</span>
            <span>Permissions</span>
          </div>
          {roles.map((role) => {
            const roleKey = getRoleKey(role);
            const isSelected = selectedRoleName === roleKey;

            return (
              <button
                key={role.name || roleKey}
                type="button"
                className={`role-row row role-select-button ${isSelected ? 'selected' : ''}`}
                onClick={() => setSelectedRoleName(roleKey)}
              >
                <span className="mono">{role.name}</span>
                <span>
                  <span className="badge success">{role.isActive === false ? 'Inactive' : 'Active'}</span>
                </span>
                <span className="role-permissions">
                  {(role.permissions || []).slice(0, 3).map((permission) => (
                    <span className="mini-pill" key={permission}>{permission}</span>
                  ))}
                  {(role.permissions || []).length > 3 ? <span className="mini-pill">+{(role.permissions || []).length - 3}</span> : null}
                </span>
              </button>
            );
          })}
        </div>
      </AdminPanel>

      <AdminPanel title="Schema Mutation Inspector" className="roles-panel inspector-panel">
        <div className="form-block">
          <label>Role selector</label>
          <select
            value={selectedRoleName}
            onChange={(event) => setSelectedRoleName(event.target.value)}
          >
            {roleOptions.map((role) => (
                <option key={role.name} value={getRoleKey(role)}>{role.name}</option>
              ))}
          </select>
        </div>

        {/* Custom role creation disabled temporarily */}

        <div className="form-block">
          <label>Selected permissions</label>
          <p className="muted-label">
            {(draftPermissions.length > 0 ? draftPermissions : selectedRole?.permissions || []).join(', ') || 'No permissions selected.'}
          </p>
        </div>

        {loading ? <p className="muted-label">Loading roles...</p> : null}
        {error ? <p className="success-copy" style={{ color: '#dc2626' }}>{error}</p> : null}
        {message ? <p className="success-copy">{message}</p> : null}

        <div className="permission-list">
          <p className="muted-label">Mutate permissions String Array</p>
          {adminPermissionCatalog.map((permission) => (
            <label className="permission-item" key={permission.value}>
              <input
                type="checkbox"
                checked={draftPermissions.includes(permission.value)}
                onChange={() => togglePermission(permission.value)}
              />
              <span>{permission.label}</span>
            </label>
          ))}
        </div>

        <button className="main-btn" type="button" onClick={handleSave} disabled={saving || loading}>
          {saving ? 'Saving...' : 'Save Permissions'}
        </button>
      </AdminPanel>
    </div>
  );
}