const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        description: { type: String },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
