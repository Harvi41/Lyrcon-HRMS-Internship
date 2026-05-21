const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// GUARD 1: Authenticate the user (Checks if they are logged in)
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }
    
    const token = authHeader.split(' ')[1];

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified; 
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

// GUARD 2: Dynamic Permission Guard 
const checkPermission = (requiredPermission) => {
    return (req, res, next) => {
        if (!req.user || !req.user.permissions) {
            return res.status(403).json({ message: "Access Denied. No permissions assigned to this user." });
        }

        const isSuperAdmin = req.user.permissions.includes('*');
        
        const hasSpecificPermission = req.user.permissions.includes(requiredPermission);

        if (!isSuperAdmin && !hasSpecificPermission) {
            return res.status(403).json({ 
                message: `Access Denied. You do not have the required permission: '${requiredPermission}'` 
            });
        }

        next(); 
    };
};

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        let userRole = String(req.user?.roleName || req.user?.role || '').toLowerCase();

        // Treat legacy 'super admin' as 'admin' for compatibility
        if (userRole === 'super admin' || userRole === 'superadmin' || userRole === 'super-admin') {
            userRole = 'admin';
        }

        if (!userRole || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `Access Denied. Role '${req.user?.roleName || req.user?.role || 'unknown'}' is unauthorized.`,
            });
        }

        next();
    };
};

module.exports = { verifyToken, checkPermission, authorizeRoles };