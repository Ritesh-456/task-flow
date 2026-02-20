const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        teamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
        members: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'viewer' },
            },
        ],
        status: { type: String, enum: ['active', 'archived', 'completed'], default: 'active' },
    },
    { timestamps: true }
);

// Compound Indexes for fast Multi-Tenant Queries
projectSchema.index({ organizationId: 1, status: 1 });
projectSchema.index({ organizationId: 1, teamId: 1 });
projectSchema.index({ organizationId: 1, owner: 1 });


const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
