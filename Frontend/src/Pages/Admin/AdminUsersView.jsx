import React, { useEffect, useMemo, useState } from 'react';
import { createDashboardUser, getRoles } from '../../lib/axios';
import { adminRoleRows } from './adminDashboardData';
import { AdminPanel } from './AdminDashboardShared';

const FALLBACK_ROLES = adminRoleRows;
const DEFAULT_ROLE_ORDER = ['admin', 'hr', 'employee'];

const normalizeRoleName = (roleName) => String(roleName || '').trim().toLowerCase();
const isDefaultRoleKey = (roleKey) => DEFAULT_ROLE_ORDER.includes(roleKey);

export default function AdminUsersView() {
  const [roles, setRoles] = useState(FALLBACK_ROLES);
  const [selectedRoleName, setSelectedRoleName] = useState('admin');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const selectedRole = useMemo(
    () => roles.find((role) => normalizeRoleName(role.name) === selectedRoleName) || roles[0],
    [roles, selectedRoleName],
  );

  useEffect(() => {
    const loadRoles = async () => {
      setLoading(true);
      setError('');

      try {
        const { data } = await getRoles();
        const apiRoles = Array.isArray(data?.roles) ? data.roles : [];

        const defaultRoles = DEFAULT_ROLE_ORDER
          .map((expectedRole) => apiRoles.find((role) => normalizeRoleName(role.name) === expectedRole) || null)
          .filter(Boolean);

        const customRoles = apiRoles.filter((role) => !isDefaultRoleKey(normalizeRoleName(role.name)));
        const combinedRoles = [...defaultRoles, ...customRoles];

        if (combinedRoles.length > 0) {
          setRoles(combinedRoles);
          setSelectedRoleName(normalizeRoleName(combinedRoles[0].name));
          return;
        }

        setRoles(FALLBACK_ROLES);
        setSelectedRoleName('admin');
      } catch (loadError) {
        setRoles(FALLBACK_ROLES);
        setSelectedRoleName('admin');
        setError(loadError?.response?.data?.message || 'Unable to load role options right now.');
      } finally {
        setLoading(false);
      }
    };

    loadRoles();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        roleName: selectedRole?.name || 'Employee',
      };

      const { data } = await createDashboardUser(payload);

      setMessage(
        `Created ${data?.user?.name || payload.name} as ${data?.role?.name || selectedRole?.name || 'Employee'}.`,
      );
      setForm({ name: '', email: '', password: '' });
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Unable to create user right now.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-grid split-grid">
      <AdminPanel title="Provisioned Roles">
        <div className="role-table">
          <div className="role-head row">
            <span>Role</span>
            <span>Permissions</span>
          </div>
          {roles.map((role) => (
            <button
              key={role.name}
              type="button"
              className={`role-row row role-select-button ${normalizeRoleName(role.name) === selectedRoleName ? 'selected' : ''}`}
              onClick={() => setSelectedRoleName(normalizeRoleName(role.name))}
            >
              <span className="mono">{role.name}</span>
              <span className="role-permissions">
                {(role.permissions || []).slice(0, 3).map((permission) => (
                  <span className="mini-pill" key={permission}>{permission}</span>
                ))}
                {(role.permissions || []).length > 3 ? <span className="mini-pill">+{(role.permissions || []).length - 3}</span> : null}
              </span>
            </button>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel title="Create Dashboard Account">
        <form className="dashboard-form" onSubmit={handleSubmit}>
          <div className="settings-grid">
            <div className="form-block">
              <label>Full name</label>
              <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Jane Doe" required />
            </div>
            <div className="form-block">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="jane@company.com" required />
            </div>
            <div className="form-block">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <div className="form-block">
              <label>Role</label>
              <select value={selectedRoleName} onChange={(event) => setSelectedRoleName(normalizeRoleName(event.target.value))}>
                {roles.map((role) => (
                  <option key={role.name} value={normalizeRoleName(role.name)}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-block" style={{ marginTop: 16 }}>
            <label>Role permissions</label>
            <p className="muted-label">
              {(selectedRole?.permissions || []).join(', ') || 'No permissions assigned yet.'}
            </p>
          </div>

          {loading ? <p className="muted-label">Loading role options...</p> : null}
          {error ? <p className="success-copy" style={{ color: '#dc2626' }}>{error}</p> : null}
          {message ? <p className="success-copy">{message}</p> : null}

          <button className="main-btn" type="submit" disabled={saving || loading}>
            {saving ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </AdminPanel>
    </div>
  );
}