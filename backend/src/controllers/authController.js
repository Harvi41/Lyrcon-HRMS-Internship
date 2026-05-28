const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const normalizedEmail = String(email || '').trim().toLowerCase();
            const providedPassword = String(password || '');

            if (!normalizedEmail || !providedPassword) {
                console.log('[LOGIN FAILED] Missing email or password. Email:', email, 'Password provided?', !!password);
                return res.status(400).json({ message: 'Email and password are required.' });
            }

            // 1. Locate the user and populate their role data
            const user = await User.findOne({ email: normalizedEmail }).populate('role');
            if (!user || !user.isActive) {
                console.log(`[LOGIN FAILED] User not found or inactive for email: ${normalizedEmail}`);
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // 2. Extract and check roles
            const roleName = String(user.role?.name || '').toLowerCase();
            const allowedRoles = new Set(['hr', 'admin', 'employee', 'super admin']);

            // allow legacy 'super admin' as admin
            const normalized = roleName === 'super admin' ? 'admin' : roleName;

            if (!allowedRoles.has(roleName) && normalized !== 'admin') {
                console.log(`[LOGIN FAILED] Role not allowed: ${roleName}`);
                return res.status(403).json({ message: 'Only the HR, admin, and employee accounts can access this dashboard.' });
            }

            const isMatch = await bcrypt.compare(providedPassword, user.password);
            if (!isMatch) {
                console.log(`[LOGIN FAILED] Password mismatch for user: ${normalizedEmail}`);
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            // 4. Update audit metrics
            await User.updateOne(
                { _id: user._id },
                { $set: { lastLogin: new Date() } }
            );

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

    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: 'Email is required.' });
            }

            const normalizedEmail = String(email).trim().toLowerCase();
            const user = await User.findOne({ email: normalizedEmail });

            // Security best practice: prevent email scanning by returning successful response
            if (!user || !user.isActive) {
                return res.status(200).json({ message: 'If that email exists in our system, a password reset link has been sent.' });
            }

            // Generate secure token
            const rawToken = crypto.randomBytes(32).toString('hex');
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

            // Save hashed token and expiry date (1 hour from now)
            user.resetPasswordToken = hashedToken;
            user.resetPasswordExpires = Date.now() + 3600000;
            await user.save();

            const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
            const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

            // Configure SMTP mailer transport
            const hasSmtpCredentials = process.env.EMAIL_USER && process.env.EMAIL_PASS;
            let emailSentSuccessfully = false;
            let emailErrorDetails = null;

            if (hasSmtpCredentials) {
                try {
                    const smtpConfig = {
                        host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
                        port: Number(process.env.EMAIL_PORT) || 2525,
                        auth: {
                            user: process.env.EMAIL_USER,
                            pass: process.env.EMAIL_PASS,
                        },
                    };
                    const transporter = nodemailer.createTransport(smtpConfig);

                    // Send custom HTML recovery email
                    await transporter.sendMail({
                        from: '"CoreHR Security" <security@lyrcon.com>',
                        to: user.email,
                        subject: 'Password Reset Request - CoreHR',
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5eaf2; border-radius: 8px;">
                                <h2 style="color: #211c6d; text-align: center;">CoreHR Password Recovery</h2>
                                <p>Hello,</p>
                                <p>We received a request to reset the password for your CoreHR account. If you did not make this request, you can safely ignore this email.</p>
                                <p>To reset your password, please click the button below within 1 hour:</p>
                                <div style="text-align: center; margin: 30px 0;">
                                    <a href="${resetUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
                                </div>
                                <p>Or copy and paste this link into your browser:</p>
                                <p style="word-break: break-all; color: #6366f1;">${resetUrl}</p>
                                <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;"/>
                                <p style="font-size: 0.85rem; color: #64748b;">This email was automatically generated. Please do not reply directly.</p>
                            </div>
                        `,
                    });
                    console.log(`[SMTP] Recovery email successfully sent to ${user.email}`);
                    emailSentSuccessfully = true;
                } catch (smtpErr) {
                    console.error('[SMTP ERROR] Failed to send recovery email via SMTP:', smtpErr.message);
                    emailErrorDetails = smtpErr.message;
                }
            }

            if (!emailSentSuccessfully) {
                // Developer Mode Fallback: Log link directly to the console for frictionless local testing
                console.log('\n======================================================');
                console.log('🔑  [FALLBACK MODE] PASSWORD RESET REQUEST  🔑');
                console.log(`User Email: ${user.email}`);
                console.log(`Reset URL:  ${resetUrl}`);
                if (emailErrorDetails) {
                    console.log(`Reason:     SMTP failed (${emailErrorDetails})`);
                }
                console.log('======================================================\n');
            }

            res.status(200).json({
                message: 'If that email exists in our system, a password reset link has been sent.',
                devNote: !emailSentSuccessfully ? 'Development mode active: check your backend terminal for the recovery link!' : undefined
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({ message: 'Server error sending password reset link', error: error.message });
        }
    },

    resetPassword: async (req, res) => {
        try {
            const { token, newPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({ message: 'Token and new password are required.' });
            }

            const hashedToken = crypto.createHash('sha256').update(String(token)).digest('hex');

            // Find unexpired matching user
            const user = await User.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() },
            });

            if (!user) {
                return res.status(400).json({ message: 'Invalid or expired password reset token.' });
            }

            // Hash the password with bcrypt and update
            user.password = await bcrypt.hash(String(newPassword), 10);
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save();

            res.status(200).json({ message: 'Password successfully updated! You can now log in.' });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({ message: 'Server error resetting password', error: error.message });
        }
    },
};

module.exports = authController;