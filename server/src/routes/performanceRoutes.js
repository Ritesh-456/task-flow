const express = require('express');
const router = express.Router();
const {
    getPerformanceDashboard,
    getRecommendations,
    updateAvailability
} = require('../controllers/performanceController');
const { protect, impersonateUser, authorize } = require('../middleware/authMiddleware');

router.get('/dashboard', protect, authorize('super_admin', 'team_admin', 'manager'), getPerformanceDashboard);
router.get('/recommendations', protect, authorize('super_admin', 'team_admin', 'manager'), getRecommendations);
router.put('/availability', protect, updateAvailability);

module.exports = router;
