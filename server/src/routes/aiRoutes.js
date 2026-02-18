const express = require('express');
const router = express.Router();
const { generateTask, chatWithAI, breakdownGoal } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateTask);
router.post('/chat', protect, chatWithAI);
router.post('/breakdown', protect, breakdownGoal);

module.exports = router;
