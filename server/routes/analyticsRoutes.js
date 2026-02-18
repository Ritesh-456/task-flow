const express = require('express');
const router = express.Router();
const {
    getOverviewStats,
    getTaskDistribution,
    getTasksOverTime,
    getUserProductivity,
    getProjectProgress
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

// Middleware to check for Admin or Manager role
const adminOrManager = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'manager')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as admin or manager' });
    }
};

router.use(protect);
router.use(adminOrManager);

router.get('/overview', getOverviewStats);
router.get('/task-distribution', getTaskDistribution);
router.get('/tasks-over-time', getTasksOverTime);
router.get('/user-productivity', getUserProductivity);
router.get('/project-progress', getProjectProgress);

module.exports = router;
