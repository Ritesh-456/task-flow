const express = require('express');
const router = express.Router();
const {
    getSystemStats,
    getUsers,
    updateUserRole,
    deleteUser,
    getProjects,
    getActivityLogs
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

// All routes are protected and require admin role
router.use(protect);
router.use(admin);

router.get('/stats', getSystemStats);
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/projects', getProjects);
router.get('/activity', getActivityLogs);

module.exports = router;
