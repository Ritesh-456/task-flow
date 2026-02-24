const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Organization.deleteMany({});
        await Team.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});
        await Notification.deleteMany({});
        await Activity.deleteMany({});
        console.log('Existing data cleared.');

        // 1. Generate IDs for relations
        const orgId = new mongoose.Types.ObjectId();
        const teamId = new mongoose.Types.ObjectId();

        const superAdminId = new mongoose.Types.ObjectId();
        const teamAdminId = new mongoose.Types.ObjectId();
        const managerId = new mongoose.Types.ObjectId();
        const employeeId = new mongoose.Types.ObjectId();

        // 2. Create Organization
        await Organization.create({
            _id: orgId,
            name: 'TaskFlow HQ',
            ownerId: superAdminId,
            plan: 'Enterprise'
        });

        // 3. Create Team
        await Team.create({
            _id: teamId,
            name: 'Core Development Team',
            organizationId: orgId,
            createdBy: superAdminId,
            teamAdmin: teamAdminId,
            members: [superAdminId, teamAdminId, managerId, employeeId]
        });

        // 4. Create Users
        const users = [
            {
                _id: superAdminId,
                name: 'Ritesh Sharma',
                email: 'ritesh.sharma@taskflow.com',
                password: 'password123',
                role: 'super_admin',
                organizationId: orgId,
                isActive: true,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ritesh'
            },
            {
                _id: teamAdminId,
                name: 'Priya Sharma',
                email: 'priya.sharma@taskflow.com',
                password: 'password123',
                role: 'team_admin',
                organizationId: orgId,
                teamId: teamId,
                isActive: true,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'
            },
            {
                _id: managerId,
                name: 'Rahul Singh',
                email: 'rahul.singh@taskflow.com',
                password: 'password123',
                role: 'manager',
                organizationId: orgId,
                teamId: teamId,
                isActive: true,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul'
            },
            {
                _id: employeeId,
                name: 'Rohit Kumar',
                email: 'rohit.kumar@taskflow.com',
                password: 'password123',
                role: 'employee',
                organizationId: orgId,
                teamId: teamId,
                isActive: true,
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit'
            }
        ];

        for (const user of users) {
            await User.create(user);
        }

        // 5. Create Project
        const project = await Project.create({
            name: 'Task Flow Evolution',
            description: 'Major platform upgrade with AI and real-time features.',
            owner: superAdminId,
            organizationId: orgId,
            teamId: teamId,
            members: [
                { user: superAdminId, role: 'admin' },
                { user: teamAdminId, role: 'editor' },
                { user: managerId, role: 'editor' },
                { user: employeeId, role: 'viewer' }
            ],
            status: 'active'
        });

        // 6. Create Task
        await Task.create({
            title: 'Implement AI Goal Breakdown',
            description: 'Use Gemini API to split high-level goals into subtasks.',
            status: 'in-progress',
            priority: 'high',
            organizationId: orgId,
            teamId: teamId,
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            assignedTo: employeeId,
            createdBy: managerId,
            projectId: project._id
        });

        console.log('Seeding completed successfully!');
        console.log('Created: 1 Org, 1 Team, 4 Users, 1 Project, 1 Task.');
        console.log('\n--- Login Credentials ---');
        console.log('Super Admin: ritesh.sharma@taskflow.com / password123');
        console.log('Team Admin:  priya.sharma@taskflow.com / password123');
        console.log('--------------------------');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
