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
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile);

router.route('/preferences')
    .put(protect, updateUserPreferences);

router.route('/')
    .get(protect, admin, getUsers);

router.route('/:id')
    .delete(protect, admin, deleteUser);

router.route('/:id/role')
    .put(protect, admin, updateUserRole);

module.exports = router;
