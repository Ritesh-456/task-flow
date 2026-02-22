const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');
const { LRUCache } = require('lru-cache');
const rbacService = require('../services/rbacService');

// 5-minute cache for heavy aggregation pipelines
const analyticsCache = new LRUCache({
    max: 50,
    ttl: 1000 * 60 * 5 // 5 mins
});

// @desc    Get analytics overview (KPIs)
// @route   GET /api/analytics/overview
// @access  Private/Admin/Manager
const getOverviewStats = async (req, res) => {
    try {
        const cacheKey = `overview_${req.user?._id}_${req.user?.organizationId || 'global'}_${req.user?.teamId || 'all'}`;
        const cached = analyticsCache.get(cacheKey);
        if (cached) return res.json(cached);

        const matchQuery = await rbacService.getTaskQueryForUser(req.user);

        const totalTasks = await Task.countDocuments(matchQuery);
        const completedTasks = await Task.countDocuments({ ...matchQuery, status: 'done' });
        const pendingTasks = await Task.countDocuments({ ...matchQuery, status: { $ne: 'done' } });
        const overdueTasks = await Task.countDocuments({
            ...matchQuery,
            deadline: { $lt: new Date() },
            status: { $ne: 'done' }
        });

        // Calculate Completion Rate
        const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

        const result = {
            totalTasks,
            completedTasks,
            pendingTasks,
            overdueTasks,
            completionRate: `${completionRate}%`
        };

        analyticsCache.set(cacheKey, result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get task distribution by status
// @route   GET /api/analytics/task-distribution
// @access  Private/Admin/Manager
const getTaskDistribution = async (req, res) => {
    try {
        const cacheKey = `dist_${req.user?._id}_${req.user?.organizationId || 'global'}_${req.user?.teamId || 'all'}`;
        const cached = analyticsCache.get(cacheKey);
        if (cached) return res.json(cached);

        const matchQuery = await rbacService.getTaskQueryForUser(req.user);

        const distribution = await Task.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format for Recharts (name, value)
        const formatted = distribution.map(item => ({
            name: item._id.charAt(0).toUpperCase() + item._id.slice(1),
            value: item.count
        }));

        analyticsCache.set(cacheKey, formatted);
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get tasks created vs completed over time (last 7 days)
// @route   GET /api/analytics/tasks-over-time
// @access  Private/Admin/Manager
const getTasksOverTime = async (req, res) => {
    try {
        const cacheKey = `time_${req.user?._id}_${req.user?.organizationId || 'global'}_${req.user?.teamId || 'all'}`;
        const cached = analyticsCache.get(cacheKey);
        if (cached) return res.json(cached);

        const matchQuery = await rbacService.getTaskQueryForUser(req.user);

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const tasks = await Task.aggregate([
            {
                $match: {
                    ...matchQuery,
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    created: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] }
                    },
                    pending: {
                        $sum: { $cond: [{ $ne: ["$status", "done"] }, 1, 0] }
                    },
                    overdue: {
                        $sum: {
                            $cond: [
                                { $and: [{ $ne: ["$status", "done"] }, { $lt: ["$deadline", new Date()] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const formatted = tasks.map(t => ({
            date: t._id,
            created: t.created,
            completed: t.completed,
            pending: t.pending,
            overdue: t.overdue
        }));

        analyticsCache.set(cacheKey, formatted);
        res.json(formatted);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get data for user productivity (tasks completed per user)
// @route   GET /api/analytics/user-productivity
// @access  Private/Admin/Manager
const getUserProductivity = async (req, res) => {
    try {
        const cacheKey = `prod_${req.user?._id}_${req.user?.organizationId || 'global'}_${req.user?.teamId || 'all'}`;
        const cached = analyticsCache.get(cacheKey);
        if (cached) return res.json(cached);

        const matchQuery = await rbacService.getTaskQueryForUser(req.user);

        const productivity = await Task.aggregate([
            { $match: { ...matchQuery, status: 'done' } },
            {
                $group: {
                    _id: '$assignedTo',
                    completedCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            { $unwind: '$user' },
            {
                $project: {
                    name: '$user.name',
                    completed: '$completedCount'
                }
            },
            { $limit: 10 } // Top 10 users
        ]);

        analyticsCache.set(cacheKey, productivity);
        res.json(productivity);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get project progress
// @route   GET /api/analytics/project-progress
// @access  Private/Admin/Manager
const getProjectProgress = async (req, res) => {
    try {
        const cacheKey = `proj_${req.user?._id}_${req.user?.organizationId || 'global'}_${req.user?.teamId || 'all'}`;
        const cached = analyticsCache.get(cacheKey);
        if (cached) return res.json(cached);

        const projectQuery = await rbacService.getProjectQueryForUser(req.user);

        const taskQuery = await rbacService.getTaskQueryForUser(req.user);

        const projects = await Project.find(projectQuery, 'name id');
        const progress = await Promise.all(projects.map(async (project) => {
            const total = await Task.countDocuments({ ...taskQuery, projectId: project.id });
            const completed = await Task.countDocuments({ ...taskQuery, projectId: project.id, status: 'done' });
            return {
                name: project.name,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0
            };
        }));

        analyticsCache.set(cacheKey, progress);
        res.json(progress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getOverviewStats,
    getTaskDistribution,
    getTasksOverTime,
    getUserProductivity,
    getProjectProgress,
    analyticsCache
};
