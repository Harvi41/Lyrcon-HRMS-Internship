const User = require('../models/User');
const Employee = require('../models/Employee');
const jwt = require('jsonwebtoken');
const { getEuclideanDistance } = require('../utils/vectorMath');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const MATCH_THRESHOLD = 0.55; // Lower values mean stricter verification filters

const biometricController = {
    // ═════════════════════════════════════════════════════════════════════════
    // 1. SAVE ONBOARDING EMBEDDING FROM FRONTEND
    // ═════════════════════════════════════════════════════════════════════════
    registerFace: async (req, res) => {
        try {
            const { embedding, deviceId } = req.body; // Expect arrays from frontend team

            if (!Array.isArray(embedding) || embedding.length === 0) {
                return res.status(400).json({ message: "Invalid or empty face feature array payload." });
            }

            const user = await User.findById(req.user.userId);
            if (!user) return res.status(404).json({ message: "User session context isolated." });

            user.faceEmbedding = embedding;
            if (deviceId) user.trustedDeviceId = deviceId; // Lock device footprint profile
            await user.save();

            return res.status(200).json({ message: "Facial metrics mapped and securely saved to your ledger!" });
        } catch (error) {
            console.error("Face registration error:", error);
            return res.status(500).json({ message: "Failed to persist face data.", error: error.message });
        }
    },

    // ═════════════════════════════════════════════════════════════════════════
    // 2. COMPARE EMBEDDING AND GENERATE SECURE CORE REGISTRATION LOGIN
    // ═════════════════════════════════════════════════════════════════════════
    verifyFaceAndLogin: async (req, res) => {
        try {
            const { email, embedding, deviceId } = req.body;

            if (!email || !Array.isArray(embedding)) {
                return res.status(400).json({ message: "Missing email identification line or biometric data array." });
            }

            const user = await User.findOne({ email: email.toLowerCase(), isActive: true }).populate('role');
            if (!user) {
                return res.status(404).json({ message: "Account profile records do not exist." });
            }

            if (!user.faceEmbedding || user.faceEmbedding.length === 0) {
                return res.status(400).json({ message: "This profile has not set up facial sign-in metrics yet." });
            }

            // 🧮 Execute Euclidean vector matrix proximity analysis
            const distance = getEuclideanDistance(embedding, user.faceEmbedding);
            console.log(`[BIOMETRIC ENGINE] Distance between face arrays: ${distance.toFixed(4)}`);

            if (distance > MATCH_THRESHOLD) {
                return res.status(401).json({ message: "Biometric identification failed. Face signature does not match." });
            }

            // Optional: Device tracking layer validation check
            if (user.trustedDeviceId && deviceId && user.trustedDeviceId !== deviceId) {
                console.log(`[ALERT] User verified face but on un-mapped hardware layout device profile.`);
            }

            // Update login analytics
            await User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } });
            const employeeProfile = await Employee.findOne({ userId: user._id, isDeleted: false });

            // Generate corporate session token signature
            const token = jwt.sign(
                {
                    userId: user._id,
                    name: user.name,
                    roleName: user.role?.name || 'Employee',
                    permissions: user.role?.permissions || [],
                    employeeId: employeeProfile?._id || null
                },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                message: 'Facial identification match certified!',
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role?.name || 'Employee',
                    employeeCode: employeeProfile?.employeeCode || 'SYS-ADMIN'
                }
            });
        } catch (error) {
            console.error("Biometric verification failure:", error);
            return res.status(500).json({ message: "Server breakdown compiling vector configurations.", error: error.message });
        }
    }
};

module.exports = biometricController;