const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, inviteCode } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let role = '';
        let teamId = null;
        let reportsTo = null;
        let createdBy = null;

        if (inviteCode) {
            const inviter = await User.findOne({ inviteCode });
            if (!inviter) {
                return res.status(400).json({ message: 'Invalid invite code' });
            }

            // Hierarchy Logic
            if (inviter.role === 'super_admin') {
                role = 'team_admin';
                // Team Admin might not have a team yet, or Super Admin assigns them to one?
                // For now, let's leave teamId null, they can create a team later.
            } else if (inviter.role === 'team_admin') {
                role = 'manager';
                teamId = inviter.teamId; // Must belong to same team
                if (!teamId) return res.status(400).json({ message: 'Inviter does not have a team yet' });
            } else if (inviter.role === 'manager') {
                role = 'employee';
                teamId = inviter.teamId; // Must belong to same team
            } else {
                return res.status(403).json({ message: 'This user role cannot invite members' });
            }

            reportsTo = inviter._id;
            createdBy = inviter._id;

        } else {
            // First user becomes Super Admin
            const count = await User.countDocuments({});
            if (count === 0) {
                role = 'super_admin';
            } else {
                return res.status(400).json({ message: 'Invite code is required for registration' });
            }
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            teamId,
            reportsTo,
            createdBy,
            inviteCode: null, // Generated later
            preferences: {},
            security: { loginHistory: [] }
        });

        // Add to Team members if teamId exists
        if (teamId) {
            const Team = require('../models/Team');
            await Team.findByIdAndUpdate(teamId, { $push: { members: user._id } });
        }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            teamId: user.teamId,
            avatar: user.avatar,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, passwordProvided: !!password });

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Record login history
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const device = req.headers['user-agent'];

            if (!user.security) {
                user.security = { loginHistory: [] };
            }
            if (!user.security.loginHistory) {
                user.security.loginHistory = [];
            }

            user.security.loginHistory.push({ ip, device });
            // Keep only last 10 logins
            if (user.security.loginHistory.length > 10) {
                user.security.loginHistory.shift();
            }
            await user.save();

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                preferences: user.preferences,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser };
