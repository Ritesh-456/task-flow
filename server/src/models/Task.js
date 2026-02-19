const mongoose = require('mongoose');

const taskSchema = mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'done'],
            default: 'todo'
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            default: 'medium'
        },
        deadline: { type: Date },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true
        }
    },
    { timestamps: true }
);

taskSchema.index({ teamId: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ projectId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ deadline: 1 });


const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
