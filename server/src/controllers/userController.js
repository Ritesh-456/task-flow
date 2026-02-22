const User = require('../models/User');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const rbacService = require('../services/rbacService');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.avatar = req.body.avatar || user.avatar;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                token: req.body.token, // Keep existing token
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user preferences
// @route   PUT /api/users/preferences
// @access  Private
const updateUserPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.preferences.theme = req.body.theme || user.preferences.theme;
            user.preferences.language = req.body.language || user.preferences.language;
            const updatedUser = await user.save();
            res.json(updatedUser.preferences);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const matchQuery = await rbacService.getUserQueryForUser(req.user);
        const users = await User.find(matchQuery).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            if (user.organizationId.toString() !== req.user.organizationId.toString()) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (!['super_admin', 'team_admin'].includes(req.user.role)) {
                return res.status(403).json({ message: 'Not authorized to delete users' });
            }
            if (req.user.role === 'team_admin' && user.teamId?.toString() !== req.user.teamId?.toString()) {
                return res.status(403).json({ message: 'Not authorized to delete users outside your team' });
            }

            await user.deleteOne();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            if (user.organizationId.toString() !== req.user.organizationId.toString()) {
                return res.status(404).json({ message: 'User not found' });
            }
            if (!['super_admin', 'team_admin'].includes(req.user.role)) {
                return res.status(403).json({ message: 'Not authorized to update roles' });
            }
            if (req.user.role === 'team_admin' && user.teamId?.toString() !== req.user.teamId?.toString()) {
                return res.status(403).json({ message: 'Not authorized to update users outside your team' });
            }

            user.role = req.body.role || user.role;
            const updatedUser = await user.save();
            res.json(updatedUser);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate Invite Code
// @route   POST /api/users/invite
// @access  Private (Manager/Admin)
const generateInviteCode = async (req, res) => {
    try {
        // Only managers+ can generate codes
        if (!['super_admin', 'team_admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized to generate invite codes' });
        }

        // Simple unique code: ROLE-RANDOM
        const code = `${req.user.role.toUpperCase().substring(0, 3)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

        req.user.inviteCode = code;
        await req.user.save();

        res.json({ inviteCode: code });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Subordinates (Recursive)
// @route   GET /api/users/subordinates
// @access  Private
const getSubordinates = async (req, res) => {
    try {
        const subordinates = await User.aggregate([
            { $match: { _id: req.user._id } },
            {
                $graphLookup: {
                    from: 'users',
                    startWith: '$_id',
                    connectFromField: '_id',
                    connectToField: 'reportsTo',
                    as: 'allSubordinates',
                    depthField: 'depth'
                }
            },
            { $project: { allSubordinates: 1, _id: 0 } }
        ]);

        if (!subordinates.length || !subordinates[0].allSubordinates) {
            return res.json([]);
        }

        // Return flattened list with depth info, excluding sensitive data
        const sanitized = subordinates[0].allSubordinates.map(sub => ({
            _id: sub._id,
            name: sub.name,
            email: sub.email,
            role: sub.role,
            avatar: sub.avatar,
            teamId: sub.teamId,
            reportsTo: sub.reportsTo,
            depth: sub.depth
        }));

        res.json(sanitized);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Team Members
// @route   GET /api/users/team-members
// @access  Private
const getTeamMembers = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        if (req.user.role === 'super_admin') {
            const allOrgMembers = await User.find({ organizationId: req.user.organizationId })
                .select('-password -__v -security')
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await User.countDocuments({ organizationId: req.user.organizationId });

            return res.json({
                data: allOrgMembers,
                total,
                page,
                pages: Math.ceil(total / limit)
            });
        }

        if (!req.user.teamId) {
            return res.status(400).json({ message: 'User is not part of a team' });
        }

        const members = await User.find({
            teamId: req.user.teamId,
            organizationId: req.user.organizationId
        })
            .select('-password -__v -security')
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments({
            teamId: req.user.teamId,
            organizationId: req.user.organizationId
        });

        res.json({
            data: members,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get users available for impersonation
// @route   GET /api/users/impersonation-targets
// @access  Private (Super Admin / Team Admin)
const getImpersonationTargets = async (req, res) => {
    try {
        const { role } = req.query; // Optional filter string
        const requesterRole = req.realUser?.role || req.user.role; // Use real user if already impersonating

        if (!['super_admin', 'team_admin'].includes(requesterRole)) {
            return res.status(403).json({ message: 'Not authorized for impersonation queries' });
        }

        let query = {};

        // Scope to org if Team Admin
        if (requesterRole === 'team_admin') {
            const orgId = req.realUser?.organizationId || req.user.organizationId;
            query.organizationId = orgId;
            query.role = { $in: ['manager', 'employee'] }; // Can't impersonate upwards
        }

        // Apply specific requested role filter, honoring previous bounds
        if (role && role !== 'all') {
            if (query.role && query.role.$in) {
                if (query.role.$in.includes(role)) query.role = role;
                else return res.json([]); // Requested role outside bounds
            } else {
                query.role = role;
            }
        }

        const targets = await User.find(query).select('_id name email role avatar teamId').limit(100);
        res.json(targets);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    updateUserPreferences,
    getUsers,
    deleteUser,
    updateUserRole,
    generateInviteCode,
    getSubordinates,
    getTeamMembers,
    getImpersonationTargets
};
