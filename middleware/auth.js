const jwt = require('jsonwebtoken');

function attachUser(req, res, next) {
    const token = req.cookies?.token;
    if (!token) {
        req.user = null;
        return next();
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: payload.userId, email: payload.email };
    } catch {
        req.user = null;
    }
    next();
}

function requireAuth(req, res, next) {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    next();
}

module.exports = { attachUser, requireAuth };
