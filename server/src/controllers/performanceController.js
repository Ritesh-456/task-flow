const User = require('../models/User');
const Task = require('../models/Task');
const rbacService = require('../services/rbacService');
const NodeCache = require('node-cache');

// Cache TTL: 5 minutes (300 seconds)
const performanceCache = new NodeCache({ stdTTL: 300 });

// @desc    Get team performance stats (Optimized)
// @route   GET /api/performance/dashboard
// @access  Private (Admin/Manager)
const getPerformanceDashboard = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const cacheKey = `dashboard_${userId}`; // Cache per user (due to role/team filtering)

        // Check cache
        const cachedData = performanceCache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        const matchStage = await rbacService.getUserQueryForUser(req.user);

        // Parallel Execution: Fetch Users and Calculate Stats via Aggregation
        const [users, stats] = await Promise.all([
            User.find({ ...matchStage, organizationId: req.user.organizationId })
                .select('name email role avatar performance isAvailable lastActiveAt')
                .lean(),

            User.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalUsers: { $sum: 1 },
                        avgRating: { $avg: '$performance.rating' },
                        totalCompleted: { $sum: '$performance.completedTasks' },
                        totalPending: { $sum: '$performance.pendingTasks' }
                    }
                }
            ])
        ]);

        const teamStats = stats.length > 0 ? stats[0] : { totalUsers: 0, avgRating: 0 };
        teamStats.avgRating = parseFloat((teamStats.avgRating || 0).toFixed(1));
        delete teamStats._id;

        const responseData = {
            teamStats,
            users
        };

        // Set Cache
        performanceCache.set(cacheKey, responseData);

        res.json(responseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get smart recommendations (Optimized)
// @route   GET /api/performance/recommendations
// @access  Private
const getRecommendations = async (req, res) => {
    try {
        const matchQuery = await rbacService.getUserQueryForUser(req.user);

        // Add recommendation specific filters
        matchQuery.isAvailable = true;
        matchQuery.isActive = true;

        // Use index { 'performance.rating': -1, 'performance.activeProjects': 1 }
        const recommended = await User.find({ ...matchQuery, organizationId: req.user.organizationId })
            .sort({ 'performance.rating': -1, 'performance.activeProjects': 1 })
            .limit(5)
            .select('name email role avatar performance')
            .lean();

        res.json(recommended);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user availability
// @route   PUT /api/performance/availability
// @access  Private
const updateAvailability = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            user.isAvailable = req.body.isAvailable;
            await user.save();

            // Invalidate cache for this user's team (approximate)
            // Ideally we'd map teamId to cache keys, but for now simple invalidation is ok
            // Or just short TTL handles it.
            performanceCache.del(`dashboard_${req.user._id}`);
            // Also need to invalidate for admins of this team... simpler to just let TTL expire or widespread clear
            performanceCache.flushAll();

            res.json({ isAvailable: user.isAvailable });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPerformanceDashboard,
    getRecommendations,
    updateAvailability,
    performanceCache
};
