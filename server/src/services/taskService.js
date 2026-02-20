const Task = require('../models/Task');

class TaskService {
    async getTasks(query, organizationId, pagination) {
        const { skip, limit } = pagination;
        return await Task.find({ ...query, organizationId })
            .select('title status priority deadline assignedTo createdBy projectId teamId')
            .populate('assignedTo', 'name email avatar')
            .populate('createdBy', 'name')
            .populate('projectId', 'name')
            .skip(skip)
            .limit(limit)
            .lean();
    }

    async countTasks(query, organizationId) {
        return await Task.countDocuments({ ...query, organizationId });
    }

    async createTask(data) {
        return await Task.create(data);
    }

    async getTaskById(id) {
        return await Task.findById(id).lean();
    }

    async populateTaskDetails(taskId) {
        return await Task.findById(taskId)
            .populate('assignedTo', 'name email avatar')
            .populate('projectId', 'name')
            .lean();
    }

    async updateTask(id, data) {
        return await Task.findByIdAndUpdate(id, data, { new: true })
            .populate('assignedTo', 'name email avatar')
            .populate('projectId', 'name')
            .lean();
    }

    async deleteTask(id) {
        const task = await Task.findById(id);
        if (task) {
            await task.deleteOne();
            return true;
        }
        return false;
    }
}

module.exports = new TaskService();
