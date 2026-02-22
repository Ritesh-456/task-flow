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
const InviteCode = require('../models/InviteCode');

const CREDENTIALS_PATH = path.join(__dirname, '../../../../test/credentials.txt');

const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(1);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Hardcoded explicit test environment
const testEnv = {
    superAdmin: { name: "Ritesh Sharma", email: "ritesh.sharma@taskflow.com" },
    teams: [
        {
            name: "Team Alpha",
            admin: { name: "Priya Sharma", email: "priya.sharma@taskflow.com" },
            managers: [
                { name: "Rahul Singh", email: "rahul.singh@taskflow.com" },
                { name: "Arjun Patel", email: "arjun.patel@taskflow.com" } // 2
            ]
        },
        {
            name: "Team Beta",
            admin: { name: "Amit Verma", email: "amit.verma@taskflow.com" },
            managers: [
                { name: "Karan Mehta", email: "karan.mehta@taskflow.com" },
                { name: "Sneha Kapoor", email: "sneha.kapoor@taskflow.com" } // 2
            ]
        },
        {
            name: "Team Gamma",
            admin: { name: "Neha Gupta", email: "neha.gupta@taskflow.com" },
            managers: [
                { name: "Vikram Reddy", email: "vikram.reddy@taskflow.com" } // 1
            ]
        } // 5 managers total
    ],
    employees: [
        // For Rahul Singh
        { name: "Rohit Sharma", email: "rohit.sharma@taskflow.com" },
        { name: "Ankit Kumar", email: "ankit.kumar@taskflow.com" },
        { name: "Pooja Singh", email: "pooja.singh@taskflow.com" },
        // For Arjun Patel
        { name: "Riya Verma", email: "riya.verma@taskflow.com" },
        { name: "Suresh Yadav", email: "suresh.yadav@taskflow.com" },
        { name: "Kavita Sharma", email: "kavita.sharma@taskflow.com" },
        // For Karan Mehta
        { name: "Deepak Gupta", email: "deepak.gupta@taskflow.com" },
        { name: "Neha Sharma", email: "neha.sharma@taskflow.com" },
        { name: "Manoj Tiwari", email: "manoj.tiwari@taskflow.com" },
        // For Sneha Kapoor
        { name: "Aarti Desai", email: "aarti.desai@taskflow.com" },
        { name: "Rajesh Kumar", email: "rajesh.kumar@taskflow.com" },
        { name: "Sanjay Patel", email: "sanjay.patel@taskflow.com" },
        // For Vikram Reddy
        { name: "Kiran Rao", email: "kiran.rao@taskflow.com" },
        { name: "Sunil Shetty", email: "sunil.shetty@taskflow.com" },
        { name: "Divya Iyer", email: "divya.iyer@taskflow.com" }
    ] // 15 total
};

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
        Organization.deleteMany({}),
        InviteCode.deleteMany({})
    ]);
    console.log('Data cleared.');
};

const generatePassword = async (pass) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(pass, salt);
};

const generateInviteCodeStr = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
};

const seedDatabase = async () => {
    await connectDB();
    await clearData();

    try {
        console.log('Generating Final Test Environment...');
        const rawPassword = '123456';
        let credsContent = "-----------------------------------\nLOGIN CREDENTIALS\n-----------------------------------\n\n";

        // 1. Super Admin & Org
        const superAdmin = new User({
            name: testEnv.superAdmin.name,
            email: testEnv.superAdmin.email,
            password: rawPassword,
            role: "super_admin",
            isActive: true,
            organizationId: new mongoose.Types.ObjectId() // temp bypass
        });

        const org = await Organization.create({
            name: "TaskFlow Org HQ",
            ownerId: superAdmin._id,
            plan: "Enterprise"
        });

        superAdmin.organizationId = org._id;
        await superAdmin.save();
        credsContent += `Super Admin:\n${superAdmin.email} / ${rawPassword}\n\n`;
        console.log(`Created Super Admin: ${superAdmin.name}`);

        // Track global IDs for distribution
        const dbAdmins = [];
        const dbManagers = [];
        const dbEmployees = [];

        // Distribute 15 employees into chunks of 3
        let employeeIdx = 0;

        // 2. Teams and Hierarchy
        credsContent += `Team Admins:\n`;
        for (const t of testEnv.teams) {
            // Team
            const team = await Team.create({
                name: t.name,
                description: `Department of ${t.name}`,
                organizationId: org._id,
                createdBy: superAdmin._id,
                teamAdmin: superAdmin._id // temporary
            });

            // Admin
            const admin = await User.create({
                name: t.admin.name,
                email: t.admin.email,
                password: rawPassword,
                role: 'team_admin',
                organizationId: org._id,
                teamId: team._id,
                reportsTo: superAdmin._id,
                performance: { rating: 9.0, completedTasks: 0, totalTasks: 0 },
                isAvailable: true
            });
            team.teamAdmin = admin._id;
            team.members.push(admin._id);
            await team.save();

            // Super Admin generates invite for this Admin
            await InviteCode.create({
                code: generateInviteCodeStr(),
                createdBy: superAdmin._id,
                role: 'team_admin',
                organizationId: org._id,
                teamId: team._id,
                isUsed: true,
                usedBy: admin._id
            });

            dbAdmins.push(admin);
            credsContent += `${admin.email} / ${rawPassword}\n`;

            // Managers
            for (const m of t.managers) {
                const manager = await User.create({
                    name: m.name,
                    email: m.email,
                    password: rawPassword,
                    role: 'manager',
                    organizationId: org._id,
                    teamId: team._id,
                    reportsTo: admin._id,
                    performance: { rating: 8.5, completedTasks: 0, totalTasks: 0 },
                    isAvailable: true
                });
                team.members.push(manager._id);

                // Admin generates invite for this Manager
                await InviteCode.create({
                    code: generateInviteCodeStr(),
                    createdBy: admin._id,
                    role: 'manager',
                    organizationId: org._id,
                    teamId: team._id,
                    isUsed: true,
                    usedBy: manager._id
                });

                dbManagers.push(manager);

                // Employees (3 for each config Manager)
                for (let e = 0; e < 3; e++) {
                    const empDef = testEnv.employees[employeeIdx++];
                    const emp = await User.create({
                        name: empDef.name,
                        email: empDef.email,
                        password: rawPassword,
                        role: 'employee',
                        organizationId: org._id,
                        teamId: team._id,
                        reportsTo: manager._id,
                        performance: { rating: 7.0, completedTasks: 0, totalTasks: 0 },
                        isAvailable: true
                    });
                    team.members.push(emp._id);

                    // Manager generates invite for this Employee
                    await InviteCode.create({
                        code: generateInviteCodeStr(),
                        createdBy: manager._id,
                        role: 'employee',
                        organizationId: org._id,
                        teamId: team._id,
                        isUsed: true,
                        usedBy: emp._id
                    });

                    dbEmployees.push(emp);
                }
            }
            await team.save(); // Save extra members
        }

        credsContent += `\nManagers:\n`;
        dbManagers.forEach(m => {
            credsContent += `${m.email} / ${rawPassword}\n`;
        });

        credsContent += `\nEmployees:\n`;
        dbEmployees.forEach(e => {
            credsContent += `${e.email} / ${rawPassword}\n`;
        });

        // 3. Generate credentials.txt
        const fsDir = path.dirname(CREDENTIALS_PATH);
        if (!fs.existsSync(fsDir)) {
            fs.mkdirSync(fsDir, { recursive: true });
        }
        fs.writeFileSync(CREDENTIALS_PATH, credsContent);
        console.log(`Credentials written to ${CREDENTIALS_PATH}`);


        // 4. Task Distribution Flow
        console.log('Generating Tasks...');
        // Super Admin assigns tasks to Admins
        const globalProjects = [];
        for (let i = 0; i < dbAdmins.length; i++) {
            const admin = dbAdmins[i];
            const p = await Project.create({
                name: `${admin.name}'s Core Initiative`,
                organizationId: org._id,
                teamId: admin.teamId,
                owner: admin._id,
                members: [{ user: admin._id, role: 'admin' }]
            });
            globalProjects.push(p);

            // Super admin -> Admin Task
            await Task.create({
                title: `Build Dashboard UI for ${p.name}`,
                projectId: p._id,
                organizationId: org._id,
                teamId: admin.teamId,
                assignedTo: admin._id,
                createdBy: superAdmin._id,
                status: 'todo',
                priority: 'high',
                deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
            });

            // Find managers under this admin
            const localManagers = dbManagers.filter(m => m.reportsTo.toString() === admin._id.toString());
            for (const manager of localManagers) {
                // Admin -> Manager Task
                await Task.create({
                    title: `API Optimization Protocol for ${manager.name}`,
                    projectId: p._id,
                    organizationId: org._id,
                    teamId: admin.teamId,
                    assignedTo: manager._id,
                    createdBy: admin._id,
                    status: 'todo',
                    priority: 'medium',
                    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });

                // Find employees under this manager
                const localEmployees = dbEmployees.filter(emp => emp.reportsTo.toString() === manager._id.toString());
                for (const emp of localEmployees) {
                    // Manager -> Employee Task
                    await Task.create({
                        title: `Testing and Deployment tasks for ${emp.name}`,
                        projectId: p._id,
                        organizationId: org._id,
                        teamId: admin.teamId,
                        assignedTo: emp._id,
                        createdBy: manager._id,
                        status: 'in-progress', // give them something to work on
                        priority: 'low',
                        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                    });
                }
            }
        }

        console.log('Seeding Completed Succesfully!');
        process.exit();
    } catch (error) {
        console.error('Error in Seeding:', error);
        process.exit(1);
    }
};

seedDatabase();
