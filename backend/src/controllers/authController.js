const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const ROLE_NAME_MAP = {
    admin: 'Super Admin',
    hr: 'HR',
    employee: 'Employee',
};

const toRoleKey = (roleName) => {
    const normalized = String(roleName || '').trim().toLowerCase();

    if (normalized === 'super admin') {
        return 'admin';
    }

    if (normalized === 'hr') {
        return 'hr';
    }

    if (normalized === 'employee') {
        return 'employee';
    }

    return normalized;
};

const resolveRoleName = (inputRole) => {
    if (!inputRole) {
        return null;
    }

    const normalized = String(inputRole).trim().toLowerCase();
    return ROLE_NAME_MAP[normalized] || inputRole;
};

const authController = {
    // 1. SIGNUP LOGIC
    signup: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;

            const roleName = resolveRoleName(role);
            if (!roleName) {
                return res.status(400).json({ message: 'Invalid role. Must be admin, employee, or hr.' });
            }

            const roleDocument = await Role.findOne({ name: roleName });
            if (!roleDocument) {
                return res.status(400).json({ message: `Role '${role}' is not configured.` });
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
                role: roleDocument._id
            });

            await newUser.save();

            const responseRole = toRoleKey(roleDocument.name);
            const token = jwt.sign(
                { userId: newUser._id, role: responseRole, name: newUser.name },
                JWT_SECRET,
                { expiresIn: '1d' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: { id: newUser._id, name: newUser.name, email: newUser.email, role: responseRole, roleName: roleDocument.name }
            });
        } catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ message: 'Server error during signup', error: error.message });
        }
    },

    // 2. LOGIN LOGIC
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email }).populate('role');
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // Packed name here so your dashboard can say "Hi <name>" easily
            const roleKey = toRoleKey(user.role?.name);
            const token = jwt.sign(
                { userId: user._id, role: roleKey, name: user.name },
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
                    role: roleKey,
                    roleName: user.role?.name || null
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login', error: error.message });
        }
    }
};

module.exports = authController;