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

        let role = 'super_admin'; // Default first user
        // OR 'employee' if we want strict mode. Let's default to super_admin if it's the very first user in DB, else employee ?
        // Actually, prompt says: "super_admin (global control)". 

        let teamId = null;
        let reportsTo = null;
        let createdBy = null;

        // INVITE CODE LOGIC
        if (inviteCode) {
            const inviter = await User.findOne({ inviteCode });
            if (!inviter) {
                return res.status(400).json({ message: 'Invalid invite code' });
            }

            teamId = inviter.teamId;
            reportsTo = inviter._id;
            createdBy = inviter._id;

            // Assign Role
            if (inviter.role === 'super_admin') {
                role = 'team_admin';
            } else if (inviter.role === 'team_admin') {
                role = 'manager';
            } else if (inviter.role === 'manager') {
                role = 'employee';
            } else {
                return res.status(400).json({ message: 'Employees cannot invite users' });
            }
        } else {
            // No code -> Check if DB is empty to make Super Admin
            const count = await User.countDocuments({});
            if (count === 0) {
                role = 'super_admin';
            } else {
                // If not first user and no code... 
                // Maybe allow creating a new Team if they want? 
                // Or just fail? "Invite code required".
                // Let's allow registration as "setup_needed" or just Team Admin of a new team?
                // For simplicity, let's default to 'team_admin' who needs to create a team, or just error.
                // Prompt implies strict hierarchy. Let's return error if not first user.
                return res.status(400).json({ message: 'Invite code required' });
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
            preferences: {},
            security: { loginHistory: [] }
        });

        // If teamId exists, add user to team
        if (teamId) {
            const Team = require('../models/Team');
            await Team.findByIdAndUpdate(teamId, { $push: { members: user._id } });
        }

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                teamId: user.teamId,
                avatar: user.avatar,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
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
