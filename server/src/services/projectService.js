const Project = require('../models/Project');

class ProjectService {
    async getProjectsByOrganization(organizationId, pagination) {
        const { skip, limit } = pagination;
        const projects = await Project.find({ organizationId })
            .select('-__v')
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Project.countDocuments({ organizationId });
        return { data: projects, total };
    }

    async getProjectsByTeam(teamId, organizationId, pagination) {
        const { skip, limit } = pagination;
        const projects = await Project.find({ teamId, organizationId })
            .select('-__v')
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await Project.countDocuments({ teamId, organizationId });
        return { data: projects, total };
    }

    async getProjectById(id, organizationId) {
        return await Project.findOne({ _id: id, organizationId })
            .populate('owner', 'name email')
            .populate('members.user', 'name email avatar role')
            .lean();
    }

    async createProject(data) {
        return await Project.create(data);
    }

    async updateProject(id, data) {
        return await Project.findByIdAndUpdate(id, data, { new: true })
            .populate('owner', 'name email')
            .populate('members.user', 'name email avatar role')
            .lean();
    }

    async deleteProject(id) {
        const project = await Project.findById(id);
        if (project) {
            await project.deleteOne();
            return true;
        }
        return false;
    }
}

module.exports = new ProjectService();
