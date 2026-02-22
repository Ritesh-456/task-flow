const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true,
            index: true
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'done'],
            default: 'todo',
            index: true
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        deadline: { type: Date, index: true },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true,
            index: true
        },
        comments: [
            {
                text: { type: String, required: true },
                userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                createdAt: { type: Date, default: Date.now }
            }
        ]
    },
    { timestamps: true }
);

// Compound Indexes for fast Multi-Tenant Queries
taskSchema.index({ organizationId: 1, status: 1 });
taskSchema.index({ organizationId: 1, teamId: 1 });
taskSchema.index({ organizationId: 1, assignedTo: 1 });
taskSchema.index({ organizationId: 1, projectId: 1 });


const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
