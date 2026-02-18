const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const seedAdmin = async () => {
    try {
        await connectDB();

        const adminEmail = 'admin@taskflow.com';
        const userExists = await User.findOne({ email: adminEmail });

        if (userExists) {
            console.log('Admin user already exists.');
        } else {
            console.log('Seeding initial users...');

            // Core Admin
            await User.create({
                name: 'Admin User',
                email: 'admin@taskflow.com',
                password: 'admin123',
                role: 'admin',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
                preferences: { theme: 'dark' },
            });

            // Manager
            await User.create({
                name: 'Sarah Chen',
                email: 'manager@taskflow.com',
                password: 'manager123',
                role: 'manager',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                preferences: { theme: 'light' },
            });

            // Employee
            await User.create({
                name: 'James Wilson',
                email: 'employee@taskflow.com',
                password: 'employee123',
                role: 'employee',
                avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
                preferences: { theme: 'dark' },
            });

            console.log('Users seeded successfully:');
            console.log('- admin@taskflow.com (admin123)');
            console.log('- manager@taskflow.com (manager123)');
            console.log('- employee@taskflow.com (employee123)');
        }
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
