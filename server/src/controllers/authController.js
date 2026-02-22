const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, gender, role: reqRole, inviteCode } = req.body;

    try {
        const userExists = await User.findOne({ email }).lean();
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let assignedRole = '';
        let teamId = null;
        let reportsTo = null;
        let createdBy = null;
        let organizationId = null;

        if (inviteCode) {
            const inviter = await User.findOne({ inviteCode });
            if (!inviter) {
                return res.status(400).json({ message: 'Invalid invite code' });
            }

            organizationId = inviter.organizationId;

            // Validate requested role against inviter hierarchy
            if (inviter.role === 'super_admin' && reqRole === 'team_admin') {
                assignedRole = reqRole;
            } else if (inviter.role === 'team_admin' && reqRole === 'manager') {
                assignedRole = reqRole;
                teamId = inviter.teamId;
                if (!teamId) return res.status(400).json({ message: 'Inviter does not have a team yet' });
            } else if (inviter.role === 'manager' && reqRole === 'employee') {
                assignedRole = reqRole;
                teamId = inviter.teamId;
            } else {
                return res.status(403).json({ message: 'Invalid role assignment for this invite code' });
            }

            reportsTo = inviter._id;
            createdBy = inviter._id;

        } else {
            // New user without invite code creates a new Organization as Super Admin
            assignedRole = 'super_admin';

            const Organization = require('../models/Organization');
            const newOrg = await Organization.create({
                name: `${name}'s Organization`,
                ownerId: new mongoose.Types.ObjectId(), // Will update after user creation
                plan: 'Basic'
            });

            organizationId = newOrg._id;

            // Auto create Default Team for new orgs
            const Team = require('../models/Team');
            const newTeam = await Team.create({
                name: "Default Team",
                description: "Initial team created during registration",
                organizationId: organizationId,
                members: [] // populated down below
            });
            teamId = newTeam._id;
        }

        // --- Avatar Generation ---
        let defaultAvatar = '';
        const lowerGender = gender ? gender.toLowerCase() : 'male';
        if (assignedRole === 'super_admin') {
            defaultAvatar = `/avatars/${lowerGender}_super_admin.png`;
        } else if (assignedRole === 'team_admin') {
            defaultAvatar = `/avatars/${lowerGender}_admin.png`;
        } else if (assignedRole === 'manager') {
            defaultAvatar = `/avatars/${lowerGender}_manager.png`;
        } else if (assignedRole === 'employee') {
            defaultAvatar = `/avatars/${lowerGender}_employee.png`;
        } else {
            defaultAvatar = `/avatars/male_employee.png`; // Fallback
        }

        const user = await User.create({
            name,
            email,
            password,
            role: assignedRole,
            teamId,
            reportsTo,
            createdBy,
            organizationId,
            inviteCode: null,
            avatar: defaultAvatar,
            preferences: {},
            security: { loginHistory: [] }
        });

        // Update Org owner if it's a new org
        if (!inviteCode && organizationId) {
            const Organization = require('../models/Organization');
            await Organization.findByIdAndUpdate(organizationId, { ownerId: user._id });
        }

        // Add to Team members if teamId exists
        if (teamId) {
            const Team = require('../models/Team');
            await Team.findByIdAndUpdate(teamId, { $push: { members: user._id } });
        }

        const token = generateToken(user._id);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            teamId: user.teamId,
            avatar: user.avatar,
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

            if (!user.security || !user.security.loginHistory) {
                user.security = { ...user.security, loginHistory: [] };
            }

            user.security.loginHistory.push({ ip, device });
            // Keep only last 10 logins
            if (user.security.loginHistory.length > 10) {
                user.security.loginHistory.shift();
            }

            user.markModified('security');
            user.markModified('security.loginHistory');
            await user.save();

            const token = generateToken(user._id);

            res.cookie('jwt', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
            });

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                preferences: user.preferences,
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

module.exports = { registerUser, loginUser, logoutUser };
