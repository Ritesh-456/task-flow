const express = require('express');
const router = express.Router();
const { getActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getActivities);

module.exports = router;
