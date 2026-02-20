const mongoose = require('mongoose');

const organizationSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        plan: {
            type: String,
            enum: ['Free', 'Basic', 'Pro', 'Enterprise'],
            default: 'Free'
        },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

const Organization = mongoose.model('Organization', organizationSchema);
module.exports = Organization;
