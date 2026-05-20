const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const JWT_SECRET = process.env.JWT_SECRET;

const ROLE_NAME_MAP = {
    admin: 'Super Admin',
    hr: 'HR',
    employee: 'Employee',
};

const resolveRoleName = (inputRole) => {
    const normalized = String(inputRole || '').trim().toLowerCase();
    return ROLE_NAME_MAP[normalized] || inputRole;
};

const authController = {
    signup: async (req, res) => {
        try {
            const { name, email, password, role, roleName } = req.body;
            const requestedRole = roleName || role;
            const resolvedRoleName = resolveRoleName(requestedRole);

            if (!resolvedRoleName) {
                return res.status(400).json({ message: 'Invalid role. Must be admin, employee, or hr.' });
            }

            const targetRole = await Role.findOne({ name: resolvedRoleName, isActive: true });
            if (!targetRole) {
                return res.status(400).json({ message: `Role '${requestedRole}' is not configured.` });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                role: targetRole._id,
                isActive: true,
            });

            await newUser.save();

            const token = jwt.sign(
                {
                    userId: newUser._id,
                    name: newUser.name,
                    roleName: targetRole.name,
                    permissions: targetRole.permissions,
                },
                JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: targetRole.name,
                    permissions: targetRole.permissions,
                },
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ message: 'Server error during signup', error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email }).populate('role');
            if (!user || !user.isActive) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            user.lastLogin = new Date();
            await user.save();

            const roleName = user.role?.name || 'Employee';
            const token = jwt.sign(
                {
                    userId: user._id,
                    name: user.name,
                    roleName,
                    permissions: user.role?.permissions || [],
                },
                JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: roleName,
                    permissions: user.role?.permissions || [],
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login', error: error.message });
        }
    },
};

module.exports = authController;