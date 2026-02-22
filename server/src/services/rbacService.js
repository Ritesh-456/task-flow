const User = require('../models/User');
const Task = require('../models/Task');

class RBACService {
    /**
     * Generates a Mongoose matchQuery object that strictly isolates data
     * based on the User's role and Organization ID.
     * 
     * @param {Object} user - The Mongoose User object (usually req.user)
     * @returns {Object} A Mongoose query object
     */
    async getTaskQueryForUser(user) {
        // 1. Mandatory Organization Isolation (Applies to all)
        let matchQuery = { organizationId: user.organizationId };

        // 2. Role-Based Scoping
        if (user.role === 'super_admin') {
            // Super admins see all org data by default, unless they explicitly filter
            return matchQuery;
        }

        if (user.role === 'team_admin') {
            // Team Admins see everything within their specific Team
            matchQuery.teamId = user.teamId;
            return matchQuery;
        }

        if (user.role === 'manager') {
            // Managers see tasks assigned to them OR their direct subordinates, or tasks they created
            const subordinates = await User.find({
                reportsTo: user._id,
                organizationId: user.organizationId
            }).select('_id');
            const subordinateIds = subordinates.map(u => u._id);

            matchQuery.$or = [
                { assignedTo: { $in: [...subordinateIds, user._id] } },
                { createdBy: user._id }
            ];
            matchQuery.teamId = user.teamId;
            return matchQuery;
        }

        // Employee fallback
        // Employees strictly see their own assigned tasks or tasks they explicitly created
        matchQuery.$or = [
            { assignedTo: user._id },
            { createdBy: user._id },
            // Optional: let them see tasks unassigned in their team? 
            // The prompt says "Only their own tasks", so strictly assignedTo
        ];
        // Override $or to strictly be exactly what the prompt asked for "Admin: team, Employee: own tasks"
        // Wait, what if they created a task but aren't assigned? Let's strictly follow the prompt to prevent any leakage.
        delete matchQuery.$or;
        matchQuery.assignedTo = user._id;

        return matchQuery;
    }

    /**
     * Generates a Mongoose matchQuery object that strictly isolates Project data
     * based on the User's role and Organization ID.
     */
    async getProjectQueryForUser(user) {
        let matchQuery = { organizationId: user.organizationId };

        if (user.role === 'super_admin') return matchQuery;

        if (user.role === 'team_admin') {
            matchQuery.teamId = user.teamId;
            return matchQuery;
        }

        // Manager / Employee can see their team and projects explicitly assigned or structurally related to tasks
        const taskQuery = await this.getTaskQueryForUser(user);
        const userTasks = await Task.find(taskQuery).select('projectId').lean();
        const relevantProjectIds = [...new Set(userTasks.map(t => t.projectId?.toString()).filter(Boolean))];

        matchQuery.$and = [
            { teamId: user.teamId },
            {
                $or: [
                    { owner: user._id },
                    { 'members.user': user._id },
                    { _id: { $in: relevantProjectIds } }
                ]
            }
        ];

        return matchQuery;
    }

    /**
     * Generates a Mongoose matchQuery object that strictly isolates User directory data
     */
    async getUserQueryForUser(user) {
        let matchQuery = { organizationId: user.organizationId };

        if (user.role === 'super_admin') return matchQuery;

        // Everyone below super admin is scoped heavily internally
        if (user.role === 'team_admin') {
            matchQuery.teamId = user.teamId;
            return matchQuery;
        }

        if (user.role === 'manager') {
            // Managers see themselves and their direct subordinates
            matchQuery.$or = [
                { _id: user._id },
                { reportsTo: user._id }
            ];
            // Also restrict them to their team domain structurally
            matchQuery.teamId = user.teamId;
            return matchQuery;
        }

        if (user.role === 'employee') {
            // Let them see team members for UI lookups (like picking collaborators), 
            // but nothing outside their team
            matchQuery.teamId = user.teamId;
            return matchQuery;
        }

        return matchQuery;
    }
}

module.exports = new RBACService();
