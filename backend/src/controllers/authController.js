const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role'); 

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const authController = {
    // 1. SIGNUP LOGIC
    signup: async (req, res) => {
        try {
            const { name, email, password, roleName } = req.body;

            const targetRole = await Role.findOne({ name: roleName, isActive: true });
            if (!targetRole) {
                return res.status(400).json({ message: `Role '${roleName}' does not exist or is inactive.` });
            }

            // Check if user already exists
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
                isActive: true
            });

            await newUser.save();

            res.status(201).json({
                message: 'User registered successfully',
                user: { 
                    id: newUser._id, 
                    name: newUser.name, 
                    email: newUser.email, 
                    role: targetRole.name 
                }
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
            if (!user || !user.isActive) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            user.lastLogin = new Date();
            await user.save();

            const token = jwt.sign(
                { 
                    userId: user._id, 
                    name: user.name,
                    roleName: user.role.name,
                    permissions: user.role.permissions
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
                    role: user.role.name,
                    permissions: user.role.permissions
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login', error: error.message });
        }
    }
};

module.exports = authController;