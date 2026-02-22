const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../src/models/User');
const Team = require('../src/models/Team');
const Project = require('../src/models/Project');
const Task = require('../src/models/Task');
const Organization = require('../src/models/Organization');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const seedRBACScenario = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data for a clean test
        await User.deleteMany({});
        await Team.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});
        await Organization.deleteMany({});

        // 1. Pre-generate IDs to resolve circular dependency
        const superAdminId = new mongoose.Types.ObjectId();
        const orgId = new mongoose.Types.ObjectId();

        console.log('Creating Super Admin and Organization...');

        // 2. Organization (Now has ownerId)
        const org = await Organization.create({
            _id: orgId,
            name: 'RBAC Test Org',
            plan: 'Enterprise',
            ownerId: superAdminId
        });

        // 3. Super Admin (Now has organizationId)
        const superAdmin = await User.create({
            _id: superAdminId,
            name: 'Super Admin',
            email: 'super@test.com',
            password: 'password123',
            role: 'super_admin',
            organizationId: orgId,
            isActive: true
        });

        // 2. 3 Admins (Teams)
        const admins = [];
        const teams = [];
        for (let i = 1; i <= 3; i++) {
            const admin = await User.create({
                name: `Admin Team ${i}`,
                email: `admin${i}@test.com`,
                password: 'password123',
                role: 'team_admin',
                organizationId: orgId,
                isActive: true
            });
            const team = await Team.create({
                name: `Team ${i}`,
                organizationId: orgId,
                createdBy: superAdmin._id,
                teamAdmin: admin._id,
                members: [admin._id]
            });
            admin.teamId = team._id;
            await admin.save();
            admins.push(admin);
            teams.push(team);
        }

        // 3. 5 Managers
        const managers = [];
        for (let i = 1; i <= 5; i++) {
            const team = teams[i % 3]; // Distribute managers across teams
            const manager = await User.create({
                name: `Manager ${i}`,
                email: `manager${i}@test.com`,
                password: 'password123',
                role: 'manager',
                organizationId: orgId,
                teamId: team._id,
                reportsTo: team.teamAdmin, // Managed by Team Admin
                isActive: true
            });
            managers.push(manager);
        }

        // 4. 15 Employees
        const employees = [];
        for (let i = 1; i <= 15; i++) {
            const manager = managers[i % 5];
            const employee = await User.create({
                name: `Employee ${i}`,
                email: `emp${i}@test.com`,
                password: 'password123',
                role: 'employee',
                organizationId: orgId,
                teamId: manager.teamId,
                reportsTo: manager._id, // Managed by Manager
                isActive: true
            });
            employees.push(employee);
        }

        // 5. 3 Projects
        const projects = [];
        for (let i = 1; i <= 3; i++) {
            const team = teams[i - 1];
            const project = await Project.create({
                name: `Project ${i}`,
                description: `Description for Project ${i}`,
                organizationId: orgId,
                teamId: team._id,
                owner: team.teamAdmin,
                members: [
                    { user: managers[i % 5], role: 'manager' },
                    { user: employees[i % 15], role: 'viewer' }
                ]
            });
            projects.push(project);
        }

        // 6. 15 Tasks
        for (let i = 1; i <= 15; i++) {
            const emp = employees[i - 1];
            const manager = managers[i % 5];
            const proj = projects[i % 3];
            await Task.create({
                title: `Task ${i}`,
                description: `Detailed description for task ${i}`,
                projectId: proj._id,
                organizationId: orgId,
                teamId: emp.teamId,
                assignedTo: emp._id,
                createdBy: manager._id,
                priority: 'medium',
                deadline: new Date(Date.now() + 86400000 * 7),
                status: 'todo'
            });
        }

        console.log('Seeding complete!');
        console.log('Super Admin: super@test.com');
        console.log('Admin 1: admin1@test.com');
        console.log('Manager 1: manager1@test.com');
        console.log('Employee 1: emp1@test.com');
        console.log('All passwords: password123');

        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedRBACScenario();
