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

        const count = await User.countDocuments({ ...keyword });
        const users = await User.find({ ...keyword })
            .select('-password') // Exclude password
            .limit(pageSize)
            .skip(pageSize * (page - 1));

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
        const projects = await Project.find({}).populate('owner', 'name email');
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
        const logs = await Activity.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(50); // Last 50 logs
        res.json(logs);
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
    getActivityLogs
};
