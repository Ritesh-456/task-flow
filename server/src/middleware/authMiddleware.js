const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auditLog = require('./auditMiddleware');

const protect = async (req, res, next) => {
    let token;

    // First check for HTTP-only cookie
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // Fallback to Bearer token if API client doesn't use cookies
    else if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            if (!req.user.isActive) {
                return res.status(401).json({ message: 'User account is deactivated' });
            }

            if (!req.user.organizationId) {
                return res.status(403).json({ message: 'User is not associated with any organization' });
            }

            // Trust the decoded backend JWT context and log it
            return auditLog(req, res, next);
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'super_admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as super admin' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

const impersonateUser = async (req, res, next) => {
    // This MUST run after `protect` so req.user is guaranteed populated
    const impersonateId = req.headers['x-impersonate-user'];

    if (!impersonateId) {
        return next();
    }

    // Only allow Super Admins and Team Admins to impersonate
    if (!['super_admin', 'team_admin'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Not authorized to impersonate users' });
    }

    try {
        const targetUser = await User.findById(impersonateId).select('-password');

        if (!targetUser) {
            return res.status(404).json({ message: 'Impersonation target not found' });
        }

        // Keep a reference to the real user for audit logging if needed
        req.realUser = req.user;

        // Security logic for Team Admins: They can only impersonate users in THEIR organization
        if (req.user.role === 'team_admin') {
            if (targetUser.organizationId.toString() !== req.user.organizationId.toString()) {
                return res.status(403).json({ message: 'Cannot impersonate a user outside your organization' });
            }
            if (['super_admin', 'team_admin'].includes(targetUser.role)) {
                // Optional constraint: Team Admins shouldn't impersonate sideways or upwards 
                return res.status(403).json({ message: 'Team Admins cannot impersonate other administrators' });
            }
        }

        // Override the contextual user for downstream queries
        req.user = targetUser;
        next();

    } catch (error) {
        console.error('Impersonation Error:', error);
        res.status(500).json({ message: 'Impersonation failed' });
    }
};

module.exports = { protect, admin, authorize, impersonateUser };
