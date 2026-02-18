const Activity = require('../models/Activity');

// @desc    Get activity logs
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
    try {
        // If admin, can see all? Or just own scopes. Let's return recent 50 global for now for simplicity in this demo context
        // In real app, filter by project/user permission
        const activities = await Activity.find({})
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
