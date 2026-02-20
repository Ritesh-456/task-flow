const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    updateUserProfile,
    updateUserPreferences,
    getUsers,
    deleteUser,
    updateUserRole
} = require('../controllers/userController');
const {
    generateInviteCode,
    getSubordinates,
    getTeamMembers
} = require('../controllers/userController');
const { protect, admin, authorize } = require('../middleware/authMiddleware');
const requireOrganization = require('../middleware/tenantMiddleware');

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/preferences')
    .put(protect, updateUserPreferences);

router.post('/invite', protect, authorize('super_admin', 'team_admin', 'manager'), generateInviteCode);
router.get('/subordinates', protect, requireOrganization, getSubordinates);
router.get('/team-members', protect, requireOrganization, getTeamMembers);

router.route('/')
    .get(protect, requireOrganization, authorize('super_admin', 'team_admin'), getUsers); // Admin sees all, TeamAdmin sees team members (logic in controller needs update or reuse getTeamMembers)


router.route('/:id')
    .delete(protect, admin, deleteUser);

router.route('/:id/role')
    .put(protect, admin, updateUserRole);

module.exports = router;
