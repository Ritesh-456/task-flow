const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects for logged in user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({
            $or: [{ owner: req.user._id }, { 'members.user': req.user._id }],
        }).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    try {
        const { name, description, members } = req.body;

        // Process members if provided (expecting array of emails or IDs)
        // For simplicity, let's assume UI sends emails to add

        const project = await Project.create({
            name,
            description,
            owner: req.user._id,
            members: [], // Initialize empty, add logic to find users by email if needed
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (project) {
            // Build simple permission check (Owner or Admin)
            if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized to update this project' });
            }

            project.name = req.body.name || project.name;
            project.description = req.body.description || project.description;
            project.status = req.body.status || project.status;

            const updatedProject = await project.save();
            res.json(updatedProject);
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (project) {
            if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(401).json({ message: 'Not authorized' });
            }
            await project.deleteOne();
            res.json({ message: 'Project removed' });
        } else {
            res.status(404).json({ message: 'Project not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Private
const addMember = async (req, res) => {
    try {
        const { email, role } = req.body;
        const project = await Project.findById(req.params.id);
        const userToAdd = await User.findOne({ email });

        if (!project) return res.status(404).json({ message: 'Project not found' });
        if (!userToAdd) return res.status(404).json({ message: 'User not found' });

        // Check if already member
        if (project.members.some(m => m.user.toString() === userToAdd._id.toString())) {
            return res.status(400).json({ message: 'User already in project' });
        }

        project.members.push({ user: userToAdd._id, role: role || 'viewer' });
        await project.save();
        res.json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { getProjects, createProject, updateProject, deleteProject, addMember };
