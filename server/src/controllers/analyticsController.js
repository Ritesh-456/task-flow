const Task = require('../models/Task');
const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Get analytics overview (KPIs)
// @route   GET /api/analytics/overview
// @access  Private/Admin/Manager
const getOverviewStats = async (req, res) => {
    try {
        const totalTasks = await Task.countDocuments();
        const completedTasks = await Task.countDocuments({ status: 'done' });
        const pendingTasks = await Task.countDocuments({ status: { $ne: 'done' } });
        const overdueTasks = await Task.countDocuments({
            deadline: { $lt: new Date() },
            status: { $ne: 'done' }
        });

        // Calculate Completion Rate
        const completionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

        res.json({
            totalTasks,
            completedTasks,
            pendingTasks,
            overdueTasks,
            completionRate: `${completionRate}%`
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get task distribution by status
// @route   GET /api/analytics/task-distribution
// @access  Private/Admin/Manager
const getTaskDistribution = async (req, res) => {
    try {
        const distribution = await Task.aggregate([
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
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const tasks = await Task.aggregate([
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    created: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] }
                    }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json(tasks.map(t => ({
            date: t._id,
            created: t.created,
            completed: t.completed
        })));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get data for user productivity (tasks completed per user)
// @route   GET /api/analytics/user-productivity
// @access  Private/Admin/Manager
const getUserProductivity = async (req, res) => {
    try {
        const productivity = await Task.aggregate([
            { $match: { status: 'done' } },
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
        const projects = await Project.find({}, 'name id');
        const progress = await Promise.all(projects.map(async (project) => {
            const total = await Task.countDocuments({ projectId: project.id });
            const completed = await Task.countDocuments({ projectId: project.id, status: 'done' });
            return {
                name: project.name,
                progress: total > 0 ? Math.round((completed / total) * 100) : 0
            };
        }));

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
    getProjectProgress
};
