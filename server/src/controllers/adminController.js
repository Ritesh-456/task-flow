const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');

// @desc    Get system-wide statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalProjects = await Project.countDocuments();
        const totalTasks = await Task.countDocuments();
        const activeTasks = await Task.countDocuments({ status: { $ne: 'done' } });
        const completedTasks = await Task.countDocuments({ status: 'done' });
        const overdueTasks = await Task.countDocuments({
            deadline: { $lt: new Date() },
            status: { $ne: 'done' }
        });

        res.json({
            users: { total: totalUsers },
            projects: { total: totalProjects },
            tasks: {
                total: totalTasks,
                active: activeTasks,
                completed: completedTasks,
                overdue: overdueTasks
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users with pagination and filtering
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const pageSize = 10;
        const page = Number(req.query.pageNumber) || 1;
        const keyword = req.query.keyword ? {
            $or: [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { email: { $regex: req.query.keyword, $options: 'i' } }
            ]
        } : {};

        let query = { ...keyword };

        // Team Isolation for Non-SuperAdmin
        if (req.user.role !== 'super_admin') {
            if (req.user.teamId) {
                query.teamId = req.user.teamId;
            } else {
                // If no teamId and not super_admin, shows nothing or self? 
                // Let's assume they can only see themselves if no team.
                query._id = req.user._id;
            }
        }

        const count = await User.countDocuments(query);
        const users = await User.find({ ...query, organizationId: req.user.organizationId })
            .select('-password') // Exclude password
            .limit(pageSize)
            .skip(pageSize * (page - 1))
            .lean();

        res.json({ users, page, pages: Math.ceil(count / pageSize), total: count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.role = req.body.role || user.role;
            await user.save();
            res.json({ message: 'User role updated', user });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all projects (Admin view)
// @route   GET /api/admin/projects
// @access  Private/Admin
const getProjects = async (req, res) => {
    try {
        // Simple list for now, can add pagination later
        let query = {};
        if (req.user.role !== 'super_admin' && req.user.teamId) {
            query.teamId = req.user.teamId;
        }

        const projects = await Project.find({ ...query, organizationId: req.user.organizationId })
            .populate('owner', 'name email')
            .lean();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all activity logs
// @route   GET /api/admin/activity
// @access  Private/Admin
const getActivityLogs = async (req, res) => {
    try {
        const logs = await Activity.find({ organizationId: req.user.organizationId })
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(50); // Last 50 logs
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all tasks (Admin view)
// @route   GET /api/admin/tasks
// @access  Private/Admin
const getTasks = async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== 'super_admin' && req.user.teamId) {
            query.teamId = req.user.teamId;
        }

        const tasks = await Task.find({ ...query, organizationId: req.user.organizationId })
            .populate('assignedTo', 'name email avatar')
            .populate('projectId', 'name')
            .sort({ createdAt: -1 })
            .lean();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getSystemStats,
    getUsers,
    updateUserRole,
    deleteUser,
    getProjects,
    getActivityLogs,
    getTasks
};
