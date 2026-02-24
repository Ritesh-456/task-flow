const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: {
            type: String,
            enum: ['super_admin', 'team_admin', 'manager', 'employee'],
            default: 'employee'
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team'
        },
        reportsTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        inviteCode: { type: String, unique: true, sparse: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        isActive: { type: Boolean, default: true },
        avatar: { type: String },
        preferences: {
            theme: { type: String, default: 'dark' },
            language: { type: String, default: 'en' },
            timezone: { type: String, default: 'UTC' },
            notifications: {
                email: { type: Boolean, default: true },
                realtime: { type: Boolean, default: true },
                taskAssigned: { type: Boolean, default: true },
                taskUpdates: { type: Boolean, default: true },
                deadlineReminder: { type: Boolean, default: true },
            },
        },
        security: {
            lastPasswordChange: { type: Date },
            loginHistory: [
                {
                    ip: String,
                    device: String,
                    date: { type: Date, default: Date.now },
                },
            ],
        },
        // Performance System
        performance: {
            rating: { type: Number, default: 5.0, min: 1.0, max: 10.0 },
            completedTasks: { type: Number, default: 0 },
            pendingTasks: { type: Number, default: 0 },
            overdueTasks: { type: Number, default: 0 },
            activeProjects: { type: Number, default: 0 },
            lastActiveAt: { type: Date, default: Date.now }
        },
        isAvailable: { type: Boolean, default: true },
        plan: {
            type: String,
            enum: ['FREE', 'BASIC', 'PRO', 'ENTERPRISE'],
            default: 'FREE'
        },
        isPaid: { type: Boolean, default: false },
        phoneNumber: { type: String },
        industry: { type: String },
        country: { type: String }
    },
    { timestamps: true }
);

// Compound Indexes for fast Multi-Tenant Queries
userSchema.index({ organizationId: 1, role: 1 });
userSchema.index({ organizationId: 1, teamId: 1 });
userSchema.index({ organizationId: 1, reportsTo: 1 });
userSchema.index({ isAvailable: 1, 'performance.rating': -1 });
userSchema.index({ teamId: 1, 'performance.rating': -1 }); // Leaderboard query

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
