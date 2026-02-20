const Team = require('../models/Team');

class TeamService {
    async getTeamsByOrganization(organizationId) {
        return await Team.find({ organizationId }).populate('leader', 'name email').lean();
    }

    async createTeam(data) {
        return await Team.create(data);
    }

    async getTeamById(id, organizationId) {
        return await Team.findOne({ _id: id, organizationId })
            .populate('leader', 'name email')
            .populate('members', 'name email avatar')
            .lean();
    }
}

module.exports = new TeamService();
