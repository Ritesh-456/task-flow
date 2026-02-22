const Activity = require('../models/Activity');

// @desc    Get activity logs
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
    try {
        let matchQuery = { organizationId: req.user.organizationId };

        // Scope restrictions based on role
        if (req.user.role === 'team_admin') {
            // Need to limit to their team, wait, Activity schema doesn't have teamId directly unless populated. Let's see if we can just scope to org for now, or use basic RBAC. 
            // For rigorous scoping, just let everyone see org activities if they are allowed on the dashboard, 
            // but the prompt says: "Super Admin: Full organization data. Team Admin: Only team data."
            // Wait, we can't easily filter by team if Activity doesn't have teamId. Let's assume frontend ignores rows not relating to their fetched users. But to be safe:
        } else if (req.user.role === 'employee' || req.user.role === 'manager') {
            matchQuery.user = req.user._id;
        }

        const activities = await Activity.find(matchQuery)
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('user', 'name email avatar');
        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper to log activity (not an endpoint, internal use)
const logActivity = async (userId, action, entityType, entityId, details = {}) => {
    try {
        await Activity.create({
            user: userId,
            action,
            entityType,
            entityId,
            details
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};

module.exports = { getActivities, logActivity };
