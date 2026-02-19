const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (Super Admin)
const createTeam = async (req, res) => {
    try {
        const { name, description, teamAdminEmail } = req.body;

        const teamExists = await Team.findOne({ name });
        if (teamExists) {
            return res.status(400).json({ message: 'Team already exists' });
        }

        // Create the team
        const team = await Team.create({
            name,
            description,
            createdBy: req.user._id,
            teamAdmin: req.user._id, // Temporary, updated below if email provided
            members: [req.user._id]
        });

        // Optionally assign a Team Admin immediately if email provided
        if (teamAdminEmail) {
            const adminUser = await User.findOne({ email: teamAdminEmail });
            if (adminUser) {
                team.teamAdmin = adminUser._id;
                team.members.push(adminUser._id);

                // Update user details
                adminUser.teamId = team._id;
                adminUser.role = 'team_admin';
                await adminUser.save();
            }
        } else {
            // Creator becomes admin if no email provided (or for testing)
            // But usually Super Admin creates teams.
            // Let's assume Super Admin creates it, and assigns themselves or someone else.
        }

        await team.save();
        res.status(201).json(team);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all teams (or user's team)
// @route   GET /api/teams
// @access  Private
const getTeams = async (req, res) => {
    try {
        if (req.user.role === 'super_admin') {
            const teams = await Team.find({}).populate('teamAdmin', 'name email');
            res.json(teams);
        } else {
            const team = await Team.findById(req.user.teamId).populate('members', 'name email role');
            res.json(team ? [team] : []);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Team Admin / Super Admin)
const updateTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // Verify ownership/permission
        if (req.user.role !== 'super_admin' && team.teamAdmin.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this team' });
        }

        team.name = req.body.name || team.name;
        team.description = req.body.description || team.description;

        const updatedTeam = await team.save();
        res.json(updatedTeam);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Super Admin)
const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        await team.deleteOne();
        res.json({ message: 'Team removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createTeam,
    getTeams,
    updateTeam,
    deleteTeam
};
