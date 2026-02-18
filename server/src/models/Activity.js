const mongoose = require('mongoose');

const activitySchema = mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        action: { type: String, required: true }, // e.g., 'created', 'updated', 'deleted'
        entityType: { type: String, required: true }, // e.g., 'task', 'project', 'user'
        entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
        details: { type: Object }, // Flexible field for extra info (e.g., old/new values)
        project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' }, // Optional, if related to a project
    },
    { timestamps: true }
);

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
