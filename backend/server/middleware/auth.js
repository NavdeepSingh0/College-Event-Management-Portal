const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'cu-events-secret-key-2026';

function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role || 'attendee';
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

function optionalAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.userId = decoded.userId;
            req.userRole = decoded.role || 'attendee';
        } catch (e) {
            // Silently ignore invalid tokens for optional auth
        }
    }
    next();
}

function organiserOnly(req, res, next) {
    if (req.userRole !== 'organiser') {
        return res.status(403).json({ error: 'Organiser access required' });
    }
    next();
}

module.exports = { authMiddleware, optionalAuth, organiserOnly };
