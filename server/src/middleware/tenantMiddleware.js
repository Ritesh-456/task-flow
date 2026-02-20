/**
 * Tenant Middleware for Strict Multi-Tenant Isolation
 * Ensures that all queries securely attach the user's organizationId.
 * No cross-tenant data leakage is permitted.
 */
const requireOrganization = (req, res, next) => {
    if (!req.user || !req.user.organizationId) {
        return res.status(403).json({
            success: false,
            message: 'Strict Tenant Isolation Failed. Organization ID is missing from Context.'
        });
    }

    // Attach organization scope to the request object directly for services to use
    req.tenantScope = { organizationId: req.user.organizationId };

    // Pass execution to the controller
    next();
};

module.exports = requireOrganization;
