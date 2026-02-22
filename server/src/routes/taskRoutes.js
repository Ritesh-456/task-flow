const express = require('express');
const router = express.Router();
const {
    getTasks,
    createTask,
    updateTask,
    deleteTask
} = require('../controllers/taskController');
const { protect, impersonateUser } = require('../middleware/authMiddleware');
const requireOrganization = require('../middleware/tenantMiddleware');

router.route('/')
    .get(protect, requireOrganization, getTasks)
    .post(protect, requireOrganization, createTask);

router.route('/:id')
    .put(protect, requireOrganization, updateTask)
    .delete(protect, requireOrganization, deleteTask);

module.exports = router;
