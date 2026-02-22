const mongoose = require('mongoose');

const inviteCodeSchema = mongoose.Schema(
    {
        code: { type: String, required: true, unique: true },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
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
        role: {
            type: String,
            enum: ['team_admin', 'manager', 'employee'],
            required: true
        },
        isUsed: { type: Boolean, default: false },
        usedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        expiresAt: { type: Date }
    },
    { timestamps: true }
);

const InviteCode = mongoose.model('InviteCode', inviteCodeSchema);
module.exports = InviteCode;
