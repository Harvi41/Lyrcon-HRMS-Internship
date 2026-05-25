const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // 1. Locate the user and populate their role data
            const user = await User.findOne({ email }).populate('role');
            if (!user || !user.isActive) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // 2. Extract and check roles
            const roleName = String(user.role?.name || '').toLowerCase();
            
            // 💡 UPDATED: Added 'employee' to the allowed login set so they don't get a 403!
            const allowedRoles = new Set(['hr', 'super admin', 'employee']);

            if (!allowedRoles.has(roleName)) {
                return res.status(403).json({ message: 'Your assigned role does not have access to this portal.' });
            }

            // 3. Cryptographic password comparison
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // 4. Update audit metrics
            user.lastLogin = new Date();
            await user.save();

            // 5. Sign the token payload (Extended to 7d for smoother development testing!)
            const token = jwt.sign(
                {
                    userId: user._id,
                    name: user.name,
                    roleName: user.role?.name || 'Employee',
                    permissions: user.role?.permissions || [],
                },
                JWT_SECRET,
                { expiresIn: '7d' } 
            );

            // 6. Return response to client
            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role?.name || 'Employee',
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