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

const cleanDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for cleanup...');

        const collections = [User, Organization, Team, Project, Task, Notification, Activity];

        for (const model of collections) {
            await model.deleteMany({});
            console.log(`Cleared collection: ${model.collection.name}`);
        }

        console.log('Database cleanup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during database cleanup:', error);
        process.exit(1);
    }
};

cleanDatabase();
