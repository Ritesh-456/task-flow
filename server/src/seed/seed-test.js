const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Import Models
const User = require('../models/User');
const Team = require('../models/Team');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Organization = require('../models/Organization');

const REPORT_PATH = path.join(__dirname, '../../../../test/report.txt');

const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(1);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const clearData = async () => {
    console.log('Clearing existing data...');
    await Promise.all([
        User.deleteMany({}),
        Team.deleteMany({}),
        Project.deleteMany({}),
        Task.deleteMany({}),
        Activity.deleteMany({}),
        Notification.deleteMany({}),
        Organization.deleteMany({})
    ]);
    console.log('Data cleared.');
};

const generatePassword = async (pass) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(pass, salt);
};

const seedDatabase = async () => {
    await connectDB();
    await clearData();

    try {
        console.log('Generating SaaS Data...');
        const rawPassword = '123456';

        // STEP 2 & 3: SUPER ADMIN & ORG
        const superAdmin = new User({
            name: "Ritesh Sharma",
            email: "superadmin@taskflow.com",
            password: rawPassword,
            role: "super_admin",
            isActive: true,
            organizationId: new mongoose.Types.ObjectId() // temp bypass
        });

        const org = await Organization.create({
            name: "TechNova Pvt Ltd",
            ownerId: superAdmin._id,
            plan: "Pro"
        });

        superAdmin.organizationId = org._id;
        await superAdmin.save();
        console.log('Super Admin & Organization created.');

        // STEP 4: TEAMS
        const teamNames = ['Team Alpha', 'Team Beta', 'Team Gamma'];
        const teams = [];
        for (const name of teamNames) {
            const team = await Team.create({
                name,
                description: `${name} description`,
                organizationId: org._id,
                createdBy: superAdmin._id,
                teamAdmin: superAdmin._id // Temporary, will update
            });
            teams.push(team);
        }

        // Tracking for report
        const reportData = {
            org: org.name,
            totalTeams: teams.length,
            totalAdmins: 0,
            totalManagers: 0,
            totalEmployees: 0,
            totalProjects: 0,
            totalTasks: 0,
            users: []
        };

        const allUsers = [superAdmin];

        // STEP 5: TEAM ADMINS (1 per team)
        for (let i = 0; i < teams.length; i++) {
            const team = teams[i];
            const admin = await User.create({
                name: `Admin ${team.name.split(' ')[1]}`,
                email: `admin${i + 1}@taskflow.com`,
                password: rawPassword,
                role: 'team_admin',
                organizationId: org._id,
                teamId: team._id,
                reportsTo: superAdmin._id,
                performance: { rating: parseFloat(randomFloat(7.5, 9.5)) },
                isAvailable: true
            });
            team.teamAdmin = admin._id;
            team.members.push(admin._id);
            await team.save();
            allUsers.push(admin);
            reportData.totalAdmins++;
            reportData.users.push(admin);

            // STEP 6: MANAGERS (2 per team)
            for (let j = 0; j < 2; j++) {
                const manager = await User.create({
                    name: `Manager ${j + 1} ${team.name.split(' ')[1]}`,
                    email: `manager${i + 1}_${j + 1}@taskflow.com`,
                    password: rawPassword,
                    role: 'manager',
                    organizationId: org._id,
                    teamId: team._id,
                    reportsTo: admin._id,
                    performance: { rating: parseFloat(randomFloat(6.0, 9.5)) },
                    isAvailable: Math.random() > 0.3
                });
                team.members.push(manager._id);
                allUsers.push(manager);
                reportData.totalManagers++;
                reportData.users.push(manager);

                // STEP 7: EMPLOYEES (3 per manager)
                for (let k = 0; k < 3; k++) {
                    const employee = await User.create({
                        name: `Employee ${k + 1} (M${j + 1} ${team.name.split(' ')[1]})`,
                        email: `employee${i + 1}_${j + 1}_${k + 1}@taskflow.com`,
                        password: rawPassword,
                        role: 'employee',
                        organizationId: org._id,
                        teamId: team._id,
                        reportsTo: manager._id,
                        performance: { rating: parseFloat(randomFloat(4.0, 9.0)) },
                        isAvailable: true
                    });
                    team.members.push(employee._id);
                    allUsers.push(employee);
                    reportData.totalEmployees++;
                    reportData.users.push(employee);
                }
            }
            await team.save();

            // STEP 8: PROJECTS (2 per team)
            for (let p = 0; p < 2; p++) {
                const project = await Project.create({
                    name: `${team.name} Project ${p + 1}`,
                    description: `Critical project ${p + 1} for ${team.name}`,
                    organizationId: org._id,
                    owner: admin._id,
                    teamId: team._id,
                    status: p === 0 ? 'active' : 'completed'
                });
                reportData.totalProjects++;

                // STEP 9: TASKS (mix)
                const teamUsers = allUsers.filter(u => u.teamId && u.teamId.equals(team._id));
                for (let t = 0; t < 10; t++) {
                    const statusRoll = Math.random();
                    let status = 'todo';
                    if (statusRoll > 0.7) status = 'done';
                    else if (statusRoll > 0.3) status = 'in-progress';

                    // Determine overdue
                    const deadline = new Date();
                    if (Math.random() > 0.8 && status !== 'done') {
                        deadline.setDate(deadline.getDate() - randomInt(1, 5)); // Overdue
                    } else {
                        deadline.setDate(deadline.getDate() + randomInt(1, 14)); // Future
                    }

                    const assignedUser = teamUsers[randomInt(0, teamUsers.length - 1)];

                    await Task.create({
                        title: `Task ${t + 1} for ${project.name}`,
                        description: `Task description...`,
                        status,
                        priority: ['low', 'medium', 'high'][randomInt(0, 2)],
                        deadline,
                        assignedTo: assignedUser._id,
                        projectId: project._id,
                        teamId: team._id,
                        organizationId: org._id
                    });

                    reportData.totalTasks++;
                }
            }
        }

        console.log('Data generation complete.');

        // STEP 10: Performance metrics update logic (simulation)
        const allCreatedTasks = await Task.find({ organizationId: org._id });

        for (const user of allUsers) {
            if (user.role === 'super_admin') continue;

            const userTasks = allCreatedTasks.filter(t => t.assignedTo && t.assignedTo.equals(user._id));
            const completed = userTasks.filter(t => t.status === 'done').length;
            const pending = userTasks.filter(t => t.status !== 'done').length;
            const overdue = userTasks.filter(t => t.status !== 'done' && new Date(t.deadline) < new Date()).length;

            user.performance.completedTasks = completed;
            user.performance.pendingTasks = pending;
            user.performance.overdueTasks = overdue;

            if (pending > 3) user.isAvailable = false;

            await user.save();
        }

        console.log('Generating Report File...');
        await generateReport(reportData, allUsers, allCreatedTasks);

        console.log('Seed and Report generation successful! Exiting.');
        process.exit(0);

    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

const generateReport = async (data, allUsers, allTasks) => {
    // Collect Data
    const managers = data.users.filter(u => u.role === 'manager');
    const sortedManagers = [...managers].sort((a, b) => b.performance.rating - a.performance.rating);
    const topManagers = sortedManagers.slice(0, 3);

    const sortedLowUsers = [...data.users].sort((a, b) => a.performance.rating - b.performance.rating);
    const lowPerfUsers = sortedLowUsers.slice(0, 5);

    const availableManagers = managers.filter(m => m.isAvailable);
    const busyManagers = managers.filter(m => !m.isAvailable);

    const completed = allTasks.filter(t => t.status === 'done').length;
    const pending = allTasks.filter(t => t.status !== 'done').length;
    const overdue = allTasks.filter(t => t.status !== 'done' && new Date(t.deadline) < new Date()).length;

    const reportContent = `
-----------------------------------
Organization Summary:

Total Teams: ${data.totalTeams}
Total Admins: ${data.totalAdmins}
Total Managers: ${data.totalManagers}
Total Employees: ${data.totalEmployees}
Total Projects: ${data.totalProjects}
Total Tasks: ${data.totalTasks}
-----------------------------------

Performance Summary:

Top Managers:
${topManagers.map(m => `- ${m.name}, Rating: ${m.performance.rating}`).join('\n')}

Low Performing Users:
${lowPerfUsers.map(u => `- ${u.name}, Rating: ${u.performance.rating}`).join('\n')}

Available Managers:
${availableManagers.map(m => `- ${m.name}`).join('\n')}

Busy Managers:
${busyManagers.map(m => `- ${m.name}`).join('\n')}
-----------------------------------

Task Summary:

Completed Tasks: ${completed}
Pending Tasks: ${pending}
Overdue Tasks: ${overdue}
-----------------------------------
`;

    // Ensure dir exists
    const dir = path.dirname(REPORT_PATH);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(REPORT_PATH, reportContent);
    console.log(`Report generated at: ${REPORT_PATH}`);
};

seedDatabase();
