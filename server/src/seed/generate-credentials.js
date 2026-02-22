const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const fs = require('fs');

const User = require('../models/User');
const Organization = require('../models/Organization');
const Team = require('../models/Team');

const CREDENTIALS_PATH = path.join(__dirname, '../../../../test/credentials.txt');

const usersToEnsure = [
    { title: 'Super Admin', name: 'Ritesh Sharma', email: 'ritesh.sharma@taskflow.com', role: 'super_admin' },
    { title: 'Team Admin', name: 'Priya Sharma', email: 'priya.sharma@taskflow.com', role: 'team_admin' },
    { title: 'Manager', name: 'Rahul Singh', email: 'rahul.singh@taskflow.com', role: 'manager' },
    { title: 'Employee', name: 'Rohit Kumar', email: 'rohit.kumar@taskflow.com', role: 'employee' }
];

const generateCredentials = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected.');

        // Get an existing Organization and Team to assign to new users
        let org = await Organization.findOne();
        let team = await Team.findOne();

        if (!org) {
            org = await Organization.create({ name: 'TaskFlow Org HQ' });
        }
        if (!team) {
            team = await Team.create({ name: 'Team Alpha', organizationId: org._id });
        }

        const rawPassword = '123456';

        for (const u of usersToEnsure) {
            let user = await User.findOne({ email: u.email });
            if (!user) {
                console.log(`Creating missing user: ${u.email}`);
                user = new User({
                    name: u.name,
                    email: u.email,
                    password: rawPassword, // Assuming User model hashes in pre-save hook based on previous seed
                    role: u.role,
                    organizationId: org._id,
                    teamId: u.role !== 'super_admin' ? team._id : undefined,
                    isActive: true
                });
                await user.save();
            } else {
                console.log(`User already exists: ${u.email}`);
                // Ensure role is correctly assigned
                if (user.role !== u.role) {
                    user.role = u.role;
                    await user.save();
                    console.log(`Updated role for ${u.email} to ${u.role}`);
                }
            }
        }

        // Generate the text file content
        let fileContent = `-----------------------------------

TaskFlow Login Credentials

-----------------------------------

`;

        for (const u of usersToEnsure) {
            fileContent += `${u.title}:
Name: ${u.name}
Email: ${u.email}
Password: 123456

-----------------------------------

`;
        }

        // Remove the last extra dashes to match the exact format requested?
        // Wait, the prompt shows "-----------------------------------" at the very end.
        // My loop adds them.

        const dir = path.dirname(CREDENTIALS_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(CREDENTIALS_PATH, fileContent.trim() + '\n');
        console.log(`Credentials file successfully written to ${CREDENTIALS_PATH}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

generateCredentials();
