const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const authController = {
    // 1. SIGNUP LOGIC
    signup: async (req, res) => {
        try {
            const { name, email, password, role } = req.body;

            if (!['admin', 'employee', 'hr'].includes(role)) {
                return res.status(400).json({ message: 'Invalid role. Must be admin, employee, or hr.' });
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
                role
            });

            await newUser.save();

            res.status(201).json({
                message: 'User registered successfully',
                user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
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

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // Packed name here so your dashboard can say "Hi <name>" easily
            const token = jwt.sign(
                { userId: user._id, role: user.role, name: user.name },
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
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login', error: error.message });
        }
    }
};

module.exports = authController;