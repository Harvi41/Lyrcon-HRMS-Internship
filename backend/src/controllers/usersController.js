const bcrypt = require('bcrypt');
const User = require('../models/User');
const Role = require('../models/Role');

const normalizeRoleName = (value) => {
  const roleName = String(value || '').trim().toLowerCase();

  if (roleName === 'admin' || roleName === 'super admin' || roleName === 'superadmin' || roleName === 'super-admin') {
    return 'Admin';
  }

  if (roleName === 'hr') {
    return 'HR';
  }

  if (roleName === 'employee') {
    return 'Employee';
  }

  return String(value || '').trim();
};

const usersController = {
  createUser: async (req, res) => {
    try {
      const { name, email, password, roleName, address } = req.body || {};

      if (!name || !email || !password || !roleName) {
        return res.status(400).json({ message: 'Provide `name`, `email`, `password`, and `roleName`.' });
      }

      let processedAddress = "";
      if (address && typeof address === 'object') {
        const parts = [address.street, address.line2, address.city, address.state, address.zip].filter(Boolean);
        processedAddress = parts.join(", ");
      } else if (typeof address === 'string') {
        processedAddress = address;
      }

      const normalizedRoleName = normalizeRoleName(roleName);
      const role = await Role.findOne({
        name: { $regex: `^${normalizedRoleName}$`, $options: 'i' },
        isActive: true,
      });

      if (!role) {
        return res.status(404).json({ message: `Role '${normalizedRoleName}' not found or inactive.` });
      }

      const existingUser = await User.findOne({ email: String(email).toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: 'A user with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(String(password), 10);

      const user = await User.create({
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        password: hashedPassword,
        role: role._id,
        address: processedAddress 
      });

      const populatedUser = await User.findById(user._id).populate('role', 'name permissions isActive');

      return res.status(201).json({
        message: 'User created successfully.',
        user: populatedUser,
        role: populatedUser?.role,
      });
    } catch (error) {
      console.error('users.createUser error:', error);
      return res.status(500).json({ message: 'Server error creating user', error: error.message });
    }
  },
};

module.exports = usersController;