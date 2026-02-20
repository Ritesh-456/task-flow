const User = require('../models/User');

class UserService {
    async getUsersByOrganization(organizationId, pagination) {
        const { skip, limit } = pagination;
        const users = await User.find({ organizationId })
            .select('-password -__v -security')
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments({ organizationId });
        return { data: users, total };
    }

    async getUsersByTeam(teamId, organizationId, pagination) {
        const { skip, limit } = pagination;
        const users = await User.find({ teamId, organizationId })
            .select('-password -__v -security')
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await User.countDocuments({ teamId, organizationId });
        return { data: users, total };
    }

    async getUserById(id) {
        return await User.findById(id).select('-password -__v -security').lean();
    }

    async getUserByEmail(email) {
        return await User.findOne({ email }).lean();
    }

    async getSubordinates(managerId, organizationId) {
        return await User.find({ reportsTo: managerId, organizationId })
            .select('_id name email')
            .lean();
    }

    async updateUser(id, data) {
        return await User.findByIdAndUpdate(id, data, { new: true })
            .select('-password -__v -security')
            .lean();
    }
}

module.exports = new UserService();
