const mongoose = require('mongoose');

const teamSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        teamAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        members: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    { timestamps: true }
);

teamSchema.index({ organizationId: 1 });
teamSchema.index({ teamAdmin: 1 });


const Team = mongoose.model('Team', teamSchema);
module.exports = Team;
