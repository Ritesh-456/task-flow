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
            console.log('Email: admin@taskflow.com');
            console.log('Password: (existing password)');
        } else {
            console.log('Creating admin user...');
            const admin = await User.create({
                name: 'Admin User',
                email: adminEmail,
                password: 'admin123',
                role: 'admin',
                avatar: 'https://github.com/shadcn.png',
                preferences: { theme: 'dark' },
                security: { loginHistory: [] }
            });
            console.log('Admin user created successfully.');
            console.log('Email: admin@taskflow.com');
            console.log('Password: admin123');
        }
        process.exit();
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
