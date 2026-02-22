const ProjectService = require('../services/projectService');
const User = require('../models/User');
const Task = require('../models/Task');
const rbacService = require('../services/rbacService');
const { performanceCache } = require('./performanceController');
const { analyticsCache } = require('./analyticsController');

// @desc    Get all projects (Team isolated)
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const projectQuery = await rbacService.getProjectQueryForUser(req.user);

        const projects = await Project.find(projectQuery)
            .select('-__v')
            .populate('owner', 'name email avatar')
            .populate('members.user', 'name email avatar')
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Project.countDocuments(projectQuery);

        res.json({
            data: projects,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
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

        if (req.user.role === 'employee') {
            return res.status(403).json({ message: 'Employees cannot create projects' });
        }
        if (!req.user.teamId && req.user.role !== 'super_admin') {
            return res.status(400).json({ message: 'User must belong to a team' });
        }

        const project = await Project.create({
            name,
            description,
            owner: req.user._id,
            teamId: req.user.teamId,
            organizationId: req.user.organizationId,
            members: members || [],
        });

        // Invalidate Performance & Analytics Caches
        performanceCache.flushAll();
        analyticsCache.clear();

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
            if (project.organizationId.toString() !== req.user.organizationId.toString()) {
                return res.status(404).json({ message: 'Project not found' });
            }

            if (req.user.role === 'employee') {
                return res.status(403).json({ message: 'Employees cannot update projects' });
            }
            // Build simple permission check (Owner or Admin)
            if (project.owner.toString() !== req.user._id.toString() && !['super_admin', 'team_admin'].includes(req.user.role)) {
                return res.status(403).json({ message: 'Not authorized to update this project' });
            }

            project.name = req.body.name || project.name;
            project.description = req.body.description || project.description;
            project.status = req.body.status || project.status;

            const updatedProject = await project.save();
            // Invalidate Performance & Analytics Caches
            performanceCache.flushAll();
            analyticsCache.clear();

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
            if (project.organizationId.toString() !== req.user.organizationId.toString()) {
                return res.status(404).json({ message: 'Project not found' });
            }
            if (req.user.role === 'employee') {
                return res.status(403).json({ message: 'Employees cannot delete projects' });
            }
            if (project.owner.toString() !== req.user._id.toString() && !['super_admin', 'team_admin'].includes(req.user.role)) {
                return res.status(403).json({ message: 'Not authorized' });
            }
            await project.deleteOne();
            // Invalidate Performance & Analytics Caches
            performanceCache.flushAll();
            analyticsCache.clear();

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

        if (!project || project.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (!userToAdd || userToAdd.organizationId.toString() !== req.user.organizationId.toString()) {
            return res.status(404).json({ message: 'User not found or in different organization' });
        }
        // Only owner or admin can add member
        if (project.owner.toString() !== req.user._id.toString() && !['super_admin', 'team_admin'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

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
