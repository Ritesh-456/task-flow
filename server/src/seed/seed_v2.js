const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');

dotenv.config();

const users = [
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@taskflow.in',
        password: 'password123', // Will be hashed by pre-save hook
        role: 'admin',
        isActive: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
        createdAt: new Date('2024-01-10')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Priya Sharma',
        email: 'priya.sharma@taskflow.in',
        password: 'password123',
        role: 'manager',
        isActive: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
        createdAt: new Date('2024-01-15')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Anish Varma',
        email: 'anish.varma@taskflow.in',
        password: 'password123',
        role: 'manager',
        isActive: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anish',
        createdAt: new Date('2024-01-20')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Sunita Das',
        email: 'sunita.das@taskflow.in',
        password: 'password123',
        role: 'employee',
        isActive: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sunita',
        createdAt: new Date('2024-02-01')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Vikram Singh',
        email: 'vikram.singh@taskflow.in',
        password: 'password123',
        role: 'employee',
        isActive: true,
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
        createdAt: new Date('2024-02-05')
    }
];

const projects = [
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'FinLife Banking CRM',
        description: 'Next-gen CRM for major Indian retail banks to manage loan lifecycles.',
        owner: users[0]._id, // Admin
        members: [
            { user: users[0]._id, role: 'admin' },
            { user: users[1]._id, role: 'editor' },
            { user: users[3]._id, role: 'editor' }
        ],
        status: 'active',
        createdAt: new Date('2024-05-15')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'QuickCart E-commerce Backend',
        description: 'Scalable Node.js microservices for high-traffic festive season sales.',
        owner: users[1]._id, // Manager Priya
        members: [
            { user: users[1]._id, role: 'admin' },
            { user: users[4]._id, role: 'editor' },
            { user: users[2]._id, role: 'editor' }
        ],
        status: 'active',
        createdAt: new Date('2024-06-01')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        name: 'Relay HR Portal',
        description: 'Internal payroll and attendance management system for Whitefield office.',
        owner: users[2]._id, // Manager Anish
        members: [
            { user: users[2]._id, role: 'admin' },
            { user: users[3]._id, role: 'editor' },
            { user: users[4]._id, role: 'editor' }
        ],
        status: 'completed',
        createdAt: new Date('2024-04-10')
    }
];

const tasks = [
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'Fix auth-token expiration bug',
        description: 'JWT tokens are expiring prematurely on the Banking CRM dashboard.',
        projectId: projects[0]._id,
        assignedTo: users[3]._id,
        createdBy: users[1]._id,
        status: 'done',
        priority: 'high',
        deadline: new Date('2024-12-01'),
        createdAt: new Date('2024-11-20'),
        updatedAt: new Date('2024-11-25')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'Design KYC upload UI',
        description: 'Implement drag-and-drop for Aadhaar and PAN card documents.',
        projectId: projects[0]._id,
        assignedTo: users[3]._id,
        createdBy: users[1]._id,
        status: 'in-progress',
        priority: 'medium',
        deadline: new Date('2025-03-01'), // Future
        createdAt: new Date('2025-02-10'),
        updatedAt: new Date('2025-02-15')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'Optimize Redis caching',
        description: 'Latency on product listings is >500ms. Goal <100ms.',
        projectId: projects[1]._id,
        assignedTo: users[4]._id,
        createdBy: users[1]._id,
        status: 'todo',
        priority: 'high',
        deadline: new Date('2025-02-28'),
        createdAt: new Date('2025-02-12'),
        updatedAt: new Date('2025-02-12')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'Integration with Razorpay',
        description: 'Seamless checkout flow for UPI and Credit Cards.',
        projectId: projects[1]._id,
        assignedTo: users[4]._id,
        createdBy: users[2]._id,
        status: 'done',
        priority: 'high',
        deadline: new Date('2024-12-15'),
        createdAt: new Date('2024-11-01'),
        updatedAt: new Date('2024-12-10')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'Payroll calculation logic overhaul',
        description: 'Update tax slabs for the new fiscal year in the Relay HR Portal.',
        projectId: projects[2]._id,
        assignedTo: users[3]._id,
        createdBy: users[2]._id,
        status: 'done',
        priority: 'high',
        deadline: new Date('2024-05-30'),
        createdAt: new Date('2024-05-01'),
        updatedAt: new Date('2024-05-25')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'API Security Audit - CRM',
        description: 'Vulnerability assessment for the banking endpoints.',
        projectId: projects[0]._id,
        assignedTo: users[4]._id,
        createdBy: users[0]._id,
        status: 'todo',
        priority: 'high',
        deadline: new Date('2025-01-15'), // Overdue relative to Feb 18
        createdAt: new Date('2024-12-20'),
        updatedAt: new Date('2024-12-20')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'Elasticsearch re-indexing',
        description: 'Fix search inconsistencies in the catalog.',
        projectId: projects[1]._id,
        assignedTo: users[4]._id,
        createdBy: users[1]._id,
        status: 'in-progress',
        priority: 'medium',
        deadline: new Date('2025-02-15'), // Slightly overdue
        createdAt: new Date('2025-02-01'),
        updatedAt: new Date('2025-02-10')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'React 19 migration test',
        description: 'Check for breaking changes in frontend hooks.',
        projectId: projects[0]._id,
        assignedTo: users[3]._id,
        createdBy: users[1]._id,
        status: 'todo',
        priority: 'low',
        deadline: new Date('2025-04-10'),
        createdAt: new Date('2025-02-18'),
        updatedAt: new Date('2025-02-18')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'Employee leave tracker UI',
        description: 'Calendar view for leave management.',
        projectId: projects[2]._id,
        assignedTo: users[4]._id,
        createdBy: users[2]._id,
        status: 'done',
        priority: 'medium',
        deadline: new Date('2024-08-01'),
        createdAt: new Date('2024-07-15'),
        updatedAt: new Date('2024-07-28')
    },
    {
        _id: new mongoose.Types.ObjectId(),
        title: 'Load balancer scaling policy',
        description: 'Auto-scale based on CPU utilization > 70%.',
        projectId: projects[1]._id,
        assignedTo: users[3]._id,
        createdBy: users[1]._id,
        status: 'todo',
        priority: 'medium',
        deadline: new Date('2025-03-20'),
        createdAt: new Date('2025-02-18'),
        updatedAt: new Date('2025-02-18')
    }
];

const notifications = [
    {
        userId: users[3]._id,
        message: 'New task assigned: Fix auth-token expiration bug',
        type: 'task_assigned',
        isRead: true,
        createdAt: new Date('2024-11-20T10:00:00Z')
    },
    {
        userId: users[4]._id,
        message: 'Deadline approaching for Elasticsearch re-indexing',
        type: 'deadline_reminder',
        isRead: false,
        createdAt: new Date('2025-02-14T09:00:00Z')
    },
    {
        userId: users[3]._id,
        message: 'Task "Design KYC upload UI" status updated to In Progress',
        type: 'status_updated',
        isRead: false,
        createdAt: new Date('2025-02-15T14:30:00Z')
    },
    {
        userId: users[4]._id,
        message: 'New task assigned: Load balancer scaling policy',
        type: 'task_assigned',
        isRead: false,
        createdAt: new Date('2025-02-18T11:00:00Z')
    },
    {
        userId: users[0]._id,
        message: 'Project "Relay HR Portal" has been completed.',
        type: 'status_updated',
        isRead: true,
        createdAt: new Date('2024-08-01T17:00:00Z')
    },
    {
        userId: users[1]._id,
        message: 'Vikram Singh completed "Integration with Razorpay"',
        type: 'status_updated',
        isRead: true,
        createdAt: new Date('2024-12-10T11:20:00Z')
    },
    {
        userId: users[2]._id,
        message: 'Sunita Das finished leave tracker logic.',
        type: 'status_updated',
        isRead: false,
        createdAt: new Date('2024-07-28T09:45:00Z')
    },
    {
        userId: users[3]._id,
        message: 'Overdue Task Reminder: API Security Audit',
        type: 'deadline_reminder',
        isRead: false,
        createdAt: new Date('2025-01-16T08:00:00Z')
    }
];

const activityLogs = [
    {
        user: users[1]._id,
        action: 'created',
        entityType: 'project',
        entityId: projects[1]._id,
        timestamp: new Date('2024-06-01T09:00:00Z')
    },
    {
        user: users[1]._id,
        action: 'created',
        entityType: 'task',
        entityId: tasks[0]._id,
        timestamp: new Date('2024-11-20T10:00:00Z')
    },
    {
        user: users[3]._id,
        action: 'updated',
        entityType: 'task',
        entityId: tasks[0]._id,
        timestamp: new Date('2024-11-25T16:00:00Z'),
        details: { status: 'done' }
    },
    {
        user: users[0]._id,
        action: 'updated',
        entityType: 'user',
        entityId: users[3]._id,
        timestamp: new Date('2024-01-15T12:00:00Z'),
        details: { action: 'Activated account' }
    },
    {
        user: users[1]._id,
        action: 'updated',
        entityType: 'project',
        entityId: projects[0]._id,
        timestamp: new Date('2024-05-20T10:30:00Z'),
        details: { action: 'Added Sunita Das to members' }
    },
    {
        user: users[2]._id,
        action: 'created',
        entityType: 'task',
        entityId: tasks[4]._id,
        timestamp: new Date('2024-05-01T11:00:00Z')
    },
    {
        user: users[3]._id,
        action: 'updated',
        entityType: 'task',
        entityId: tasks[4]._id,
        timestamp: new Date('2024-05-25T15:45:00Z'),
        details: { status: 'done' }
    },
    {
        user: users[4]._id,
        action: 'updated',
        entityType: 'task',
        entityId: tasks[6]._id,
        timestamp: new Date('2025-02-10T14:00:00Z'),
        details: { status: 'in-progress' }
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seating...');

        // Clear existing data
        await User.deleteMany({});
        await Project.deleteMany({});
        await Task.deleteMany({});
        await Notification.deleteMany({});
        await Activity.deleteMany({});
        console.log('Existing data cleared.');

        // Insert new data
        // Use for...of and User.create to ensure pre-save hooks (password hashing) are triggered
        for (const user of users) {
            await User.create(user);
        }

        await Project.insertMany(projects);
        await Task.insertMany(tasks);
        await Notification.insertMany(notifications);
        await Activity.insertMany(activityLogs);

        console.log('Seeding completed successfully!');
        console.log('Created 5 Users, 3 Projects, 10 Tasks, 8 Notifications, 8 Activity Logs.');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
