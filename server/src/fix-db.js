const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskflow').then(async () => {
    try {
        const user = await User.findOne({ email: 'rohit.kumar@taskflow.com' });
        if (user) {
            user.password = '123456';
            await user.save();
            console.log('Fixed Rohit password!');
        }

        // Check if security error might be causing 500s
        await User.updateMany(
            { security: { $exists: false } },
            { $set: { security: { loginHistory: [] } } }
        );
        console.log('Fixed user security tracking objects');

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
});
