const cron = require('node-cron');
const User = require('./models/User');
const Task = require('./models/Task');

// Initialize Cron Jobs
const initCronJobs = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running daily performance update...');
        try {
            const users = await User.find({});
            for (const user of users) {
                const tasks = await Task.find({ assignedTo: user._id });
                if (tasks.length === 0) continue;

                const completed = tasks.filter(t => t.status === 'done').length;
                const pending = tasks.filter(t => t.status !== 'done').length;
                const overdue = tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done').length;
                const total = tasks.length;

                let rating = (completed / total) * 10;
                rating = rating - (overdue * 0.5);
                rating = Math.max(1.0, Math.min(10.0, rating));

                user.performance = {
                    rating: parseFloat(rating.toFixed(1)),
                    completedTasks: completed,
                    pendingTasks: pending,
                    overdueTasks: overdue,
                    activeProjects: user.performance?.activeProjects || 0,
                    lastActiveAt: user.performance?.lastActiveAt || new Date()
                };

                // Availability Logic
                user.isAvailable = pending < 5;

                await user.save();
            }
            console.log('Daily performance update completed.');
        } catch (error) {
            console.error('Error in daily performance job:', error);
        }
    });
};

module.exports = initCronJobs;
