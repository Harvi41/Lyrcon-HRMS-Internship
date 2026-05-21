const Role = require('../models/Role');

const DEFAULT_ROLES = [
  {
    name: 'Admin',
    description: 'Full system access',
    permissions: ['*'],
    isDefault: true,
  },
  {
    name: 'HR',
    description: 'Human Resource Manager',
    permissions: ['employee.view', 'employee.create', 'employee.edit', 'employee.delete'],
    isDefault: true,
  },
  {
    name: 'Employee',
    description: 'Basic employee access',
    permissions: ['employee.view_self'],
    isDefault: true,
  },
];

const normalizeRoleName = (val) => {
  if (!val) return val;
  const s = String(val).trim().toLowerCase();
  if (s === 'hr') return 'HR';
  if (s === 'admin' || s === 'super admin') return 'Admin';
  if (s === 'employee') return 'Employee';
  if (s === 'custom') return 'Custom';
  // fallback: capitalize
  return val.charAt(0).toUpperCase() + val.slice(1);
};

const rolesController = {
  updatePermissions: async (req, res) => {
    try {
      const { role, permissions, customName } = req.body || {};

      if (!role || !Array.isArray(permissions)) {
        return res.status(400).json({ message: 'Invalid payload. Provide `role` and `permissions` array.' });
      }

      const roleName = normalizeRoleName(role === 'custom' && customName ? customName : role);
      const sanitizedPermissions = [...new Set(permissions.map((permission) => String(permission).trim()).filter(Boolean))];

      if (roleName === 'Admin' && !sanitizedPermissions.includes('*')) {
        sanitizedPermissions.unshift('*');
      }

      const updated = await Role.findOneAndUpdate(
        { name: roleName },
        { $set: { permissions: sanitizedPermissions } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({ message: 'Role updated', role: updated });
    } catch (error) {
      console.error('roles.updatePermissions error:', error);
      return res.status(500).json({ message: 'Server error updating role', error: error.message });
    }
  },
  listRoles: async (req, res) => {
    try {
      const roles = await Role.find({}).select('name permissions isActive createdAt updatedAt');
      const roleMap = new Map(roles.map((role) => [String(role.name || '').trim().toLowerCase(), role]));

      const mergedRoles = DEFAULT_ROLES.map((defaultRole) => {
        const existingRole = roleMap.get(defaultRole.name.toLowerCase());

        if (existingRole) {
          return existingRole;
        }

        return defaultRole;
      });

      return res.status(200).json({ roles: mergedRoles });
    } catch (error) {
      console.error('roles.listRoles error:', error);
      return res.status(500).json({ message: 'Server error listing roles', error: error.message });
    }
  },
};

module.exports = rolesController;
