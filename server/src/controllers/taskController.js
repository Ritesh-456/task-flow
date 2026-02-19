const Task = require('../models/Task');
const User = require('../models/User');

// Helper to update user performance
const updatePerformance = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        const tasks = await Task.find({ assignedTo: userId });

        const total = tasks.length;
        if (total === 0) return;

        const completed = tasks.filter(t => t.status === 'done').length;
        const pending = tasks.filter(t => t.status !== 'done').length;
        const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length;

        // Rating Formula: (Completed / Total) * 10 - (Overdue * 0.5)
        let rating = (completed / total) * 10;
        rating = rating - (overdue * 0.5);

        // Clamp rating
        rating = Math.max(1.0, Math.min(10.0, rating));

        user.performance = {
            rating: parseFloat(rating.toFixed(1)),
            completedTasks: completed,
            pendingTasks: pending,
            overdueTasks: overdue,
            activeProjects: user.performance?.activeProjects || 0, // Keep existing or update elsewhere
            lastActiveAt: new Date()
        };

        // Availability Logic
        // Available if pending < 5 (Example threshold)
        user.isAvailable = pending < 5;

        await user.save();
    } catch (error) {
        console.error('Error updating performance:', error);
    }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        let query = {};

        // Role-based filtering
        if (req.user.role === 'super_admin') {
            // Can see all, or filter by team if provided
            if (req.query.teamId) {
                query.teamId = req.query.teamId;
            }
        } else if (req.user.role === 'team_admin') {
            // See all in team
            query.teamId = req.user.teamId;
        } else if (req.user.role === 'manager') {
            // See own + subordinates
            // First get subordinates
            const subordinates = await User.find({ reportsTo: req.user._id }).select('_id');
            const subordinateIds = subordinates.map(u => u._id);
            // Also include own tasks
            query.$or = [
                { assignedTo: { $in: [...subordinateIds, req.user._id] } },
                { createdBy: req.user._id }
            ];
            // Ensure strict team isolation
            query.teamId = req.user.teamId;
        } else {
            // Employee: See own tasks only
            query.assignedTo = req.user._id;
            query.teamId = req.user.teamId;
        }

        const tasks = await Task.find(query)
            .populate('assignedTo', 'name email avatar')
            .populate('createdBy', 'name')
            .populate('projectId', 'name')
            .lean();

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    const { title, description, projectId, assignedTo, priority, deadline, status } = req.body;

    try {
        if (!req.user.teamId && req.user.role !== 'super_admin') {
            return res.status(400).json({ message: 'User must belong to a team to create tasks' });
        }

        const task = await Task.create({
            title,
            description,
            projectId,
            teamId: req.user.teamId, // Auto-assign to creator's team
            assignedTo: assignedTo || req.user._id,
            assignedBy: req.user._id, // Add this field if needed in schema, or just infer from createdBy
            createdBy: req.user._id,
            priority,
            deadline,
            status: status || 'todo'
        });

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name email avatar')
            .populate('projectId', 'name');

        res.status(201).json(populatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permission (Basic check: same team)
        if (task.teamId && task.teamId.toString() !== req.user.teamId?.toString() && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to update tasks from another team' });
        }

        // Detailed permission could go here (e.g. employee can only update status)

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('assignedTo', 'name email avatar')
            .populate('projectId', 'name');

        res.json(updatedTask);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permission 
        if (task.teamId && task.teamId.toString() !== req.user.teamId?.toString() && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await task.deleteOne();
        res.json({ message: 'Task removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};
