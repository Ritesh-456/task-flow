const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get user profile (including settings)
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
            if (req.body.avatar) user.avatar = req.body.avatar;

            if (req.body.password) {
                // Should verify old password here ideally, but for simplicity:
                user.password = req.body.password;
                user.security.lastPasswordChange = Date.now();
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                avatar: updatedUser.avatar,
                preferences: updatedUser.preferences,
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
        // Use req.user directly since it's already fetched by middleware
        const user = await User.findById(req.user._id);

        if (user) {
            // Update fields individually to avoid Mongoose subdocument spread issues
            if (req.body.theme) user.preferences.theme = req.body.theme;
            if (req.body.language) user.preferences.language = req.body.language;
            if (req.body.timezone) user.preferences.timezone = req.body.timezone;

            // Handle notifications separately if provided
            if (req.body.notifications) {
                user.preferences.notifications = {
                    ...user.preferences.notifications,
                    ...req.body.notifications
                };
            }

            const updatedUser = await user.save();
            res.json(updatedUser.preferences);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Update Preferences Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
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
            user.role = req.body.role || user.role;
            const updatedUser = await user.save();
            res.json({ _id: updatedUser._id, role: updatedUser.role });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
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
};
