/**
 * Strict Audit Logging Middleware
 * 
 * Logs explicit details of every API request connecting through
 * to backend operations. Prints the derived user role explicitly
 * to ensure we never trust frontend unverified contexts.
 */
const auditLog = (req, res, next) => {
    // Only log if user is properly authenticated traversing protect() 
    if (req.user) {
        console.log(`[AUDIT] - User: ${req.user._id} | Role (JWT Derived): ${req.user.role} | Org: ${req.user.organizationId} | Method: ${req.method} | Path: ${req.originalUrl || req.url}`);

        // Log query payloads as requested
        if (Object.keys(req.query).length > 0) {
            console.log(`[AUDIT] -> Queries: ${JSON.stringify(req.query)}`);
        }
    }
    next();
};

module.exports = auditLog;
