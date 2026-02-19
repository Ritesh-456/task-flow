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
    },
    { timestamps: true }
);

userSchema.index({ teamId: 1 });
userSchema.index({ reportsTo: 1 });
userSchema.index({ role: 1 });
userSchema.index({ inviteCode: 1 });


userSchema.pre('save', async function (next) { // Keep next for backward compatibility or just remove it
    if (!this.isModified('password')) {
        return; // Just return promise
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
