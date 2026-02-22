const TaskService = require('../services/taskService');
const User = require('../models/User'); // Kept for updatePerformance helper only
const Activity = require('../models/Activity');

// Helper to update user performance
const updatePerformance = async (userId, organizationId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return;

        // Use Service Layer instead of raw model
        const tasksResponse = await TaskService.getTasks({ assignedTo: userId }, organizationId, { skip: 0, limit: 1000 });
        const tasks = tasksResponse; // Depending on how you structured TaskService returning raw array here vs obj

        // ... Keep existing grading logic ...
        const total = tasks.length;
        if (total === 0) return;

        const completed = tasks.filter(t => t.status === 'done').length;
        const pending = tasks.filter(t => t.status !== 'done').length;
        const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length;

        // Rating Formula: (Completed / Total) * 10
        let rating = (completed / total) * 10;

        user.performance = {
            rating: parseFloat(rating.toFixed(1)),
            completedTasks: completed,
            pendingTasks: pending,
            overdueTasks: overdue,
            activeProjects: user.performance?.activeProjects || 0,
            lastActiveAt: new Date()
        };

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
            if (req.query.teamId) {
                query.teamId = req.query.teamId;
            }
        } else if (req.user.role === 'team_admin') {
            query.teamId = req.user.teamId;
        } else if (req.user.role === 'manager') {
            const subordinates = await User.find({
                reportsTo: req.user._id,
                organizationId: req.user.organizationId
            }).select('_id');
            const subordinateIds = subordinates.map(u => u._id);
            query.$or = [
                { assignedTo: { $in: [...subordinateIds, req.user._id] } },
                { createdBy: req.user._id }
            ];
            query.teamId = req.user.teamId;
        } else {
            query.assignedTo = req.user._id;
            query.teamId = req.user.teamId;
        }

        // Pagination parameters
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const tasks = await TaskService.getTasks(query, req.user.organizationId, { skip, limit });
        const total = await TaskService.countTasks(query, req.user.organizationId);

        res.json({
            data: tasks,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    let { title, description, projectId, assignedTo, priority, deadline, status, autoAssign } = req.body;

    try {
        if (!req.user.teamId && req.user.role !== 'super_admin') {
            return res.status(400).json({ message: 'User must belong to a team to create tasks' });
        }

        // Auto Assignment Logic
        if (autoAssign === true || !assignedTo) {
            const candidates = await User.find({
                teamId: req.user.teamId,
                organizationId: req.user.organizationId,
                role: { $in: ['employee', 'manager'] }
            }).sort({ 'performance.rating': -1, isAvailable: -1 });

            const bestCandidate = candidates.find(c => c.isAvailable) || candidates[0];
            assignedTo = bestCandidate ? bestCandidate._id : req.user._id;
        }

        const task = await TaskService.createTask({
            title,
            description,
            projectId,
            organizationId: req.user.organizationId,
            teamId: req.user.teamId,
            assignedTo: assignedTo,
            createdBy: req.user._id,
            priority,
            deadline,
            status: status || 'todo'
        });

        const populatedTask = await TaskService.populateTaskDetails(task._id);

        // Track Activity
        await Activity.create({
            user: req.user._id,
            organizationId: req.user.organizationId,
            action: 'created',
            entityType: 'task',
            entityId: task._id,
            project: projectId
        });

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
        const task = await TaskService.getTaskById(req.params.id);

        if (!task || task.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check permission (Basic check: same team)
        if (task.teamId && task.teamId.toString() !== req.user.teamId?.toString() && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to update tasks from another team' });
        }

        // Detail task completion comment rule
        const isCompleting = req.body.status === 'done' && task.status !== 'done';
        if (isCompleting && !req.body.comment) {
            return res.status(400).json({ message: 'A comment detailing the work done is required to complete this task.' });
        }

        const updateData = { ...req.body };
        const updateOp = { $set: updateData };

        if (req.body.comment) {
            updateOp.$push = {
                comments: {
                    text: req.body.comment,
                    userId: req.user._id
                }
            };
            delete updateOp.$set.comment;
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            updateOp,
            { new: true }
        ).populate('assignedTo', 'name email avatar')
            .populate('projectId', 'name');

        if (isCompleting) {
            // Update performance asynchronously
            updatePerformance(updatedTask.assignedTo, updatedTask.organizationId);
        }

        // Track Activity
        await Activity.create({
            user: req.user._id,
            organizationId: req.user.organizationId,
            action: isCompleting ? 'completed' : 'updated',
            entityType: 'task',
            entityId: updatedTask._id,
            project: updatedTask.projectId,
            details: isCompleting ? { comment: req.body.comment } : { fields: Object.keys(req.body) }
        });

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
