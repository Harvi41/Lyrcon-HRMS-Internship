const Role = require('../models/Role');

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

      const updated = await Role.findOneAndUpdate(
        { name: roleName },
        { $set: { permissions } },
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
      return res.status(200).json({ roles });
    } catch (error) {
      console.error('roles.listRoles error:', error);
      return res.status(500).json({ message: 'Server error listing roles', error: error.message });
    }
  },
};

module.exports = rolesController;
