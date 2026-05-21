const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const normalizedEmail = String(email || '').trim().toLowerCase();
            const providedPassword = String(password || '');

            if (!normalizedEmail || !providedPassword) {
                return res.status(400).json({ message: 'Email and password are required.' });
            }

            const user = await User.findOne({ email: normalizedEmail }).populate('role');
            if (!user || !user.isActive) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const roleName = String(user.role?.name || '').toLowerCase();
            const allowedRoles = new Set(['hr', 'admin', 'employee', 'super admin']);

            // allow legacy 'super admin' as admin
            const normalized = roleName === 'super admin' ? 'admin' : roleName;

            if (!allowedRoles.has(roleName) && normalized !== 'admin') {
                return res.status(403).json({ message: 'Only the HR, admin, and employee accounts can access this dashboard.' });
            }

            const isMatch = await bcrypt.compare(providedPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            user.lastLogin = new Date();
            await user.save();

            const token = jwt.sign(
                {
                    userId: user._id,
                    name: user.name,
                    roleName: user.role?.name || 'HR',
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
