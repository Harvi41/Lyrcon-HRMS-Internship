const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Guard 1: Verify if the user is logged in
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    // Check if the Authorization header exists and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }
    const token = authHeader.split(' ')[1];

    try {
        // Decode and verify the token
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

// Guard 2: Verify if the logged-in user has the correct role
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `Access Denied. Role '${req.user?.role}' is unauthorized.` 
            });
        }
        next();
    };
};

module.exports = { verifyToken, authorizeRoles };