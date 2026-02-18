const aiService = require('../services/aiService');
const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Generate task from natural language
// @route   POST /api/ai/generate
// @access  Private
const generateTask = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: 'Text input is required' });
        }

        const taskData = await aiService.generateTaskFromText(text);
        res.json(taskData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Chat with AI Assistant
// @route   POST /api/ai/chat
// @access  Private
const chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;

        // Fetch user's tasks and projects for context
        const tasks = await Task.find({
            $or: [{ assignedTo: req.user._id }, { createdBy: req.user._id }]
        }).select('title status priority deadline');

        const projects = await Project.find({
            $or: [{ owner: req.user._id }, { 'members.user': req.user._id }]
        }).select('name status');

        const context = { tasks, projects };

        const response = await aiService.getChatResponse(message, context);
        res.json({ response });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Break down goal into subtasks
// @route   POST /api/ai/breakdown
// @access  Private
const breakdownGoal = async (req, res) => {
    try {
        const { goal } = req.body;
        const subtasks = await aiService.breakdownGoal(goal);
        res.json({ subtasks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    generateTask,
    chatWithAI,
    breakdownGoal
};
