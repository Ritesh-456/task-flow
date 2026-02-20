const mongoose = require('mongoose');

const notificationSchema = mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: true
        },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ['task_assigned', 'status_updated', 'deadline_reminder'],
            required: true
        },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
