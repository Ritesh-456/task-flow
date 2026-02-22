const express = require('express');
const router = express.Router();
const {
    createTeam,
    getTeams,
    updateTeam,
    deleteTeam
} = require('../controllers/teamController');
const { protect, impersonateUser, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('super_admin'), createTeam)
    .get(protect, getTeams); // Super admin sees all, users see their own

router.route('/:id')
    .put(protect, authorize('super_admin', 'team_admin'), updateTeam)
    .delete(protect, authorize('super_admin'), deleteTeam);

module.exports = router;
