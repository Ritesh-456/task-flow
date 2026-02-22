const express = require('express');
const router = express.Router();
const {
    getProjects,
    createProject,
    updateProject,
    deleteProject,
    addMember
} = require('../controllers/projectController');
const { protect, impersonateUser } = require('../middleware/authMiddleware');
const requireOrganization = require('../middleware/tenantMiddleware');

router.route('/')
    .get(protect, requireOrganization, getProjects)
    .post(protect, requireOrganization, createProject);

router.route('/:id')
    .put(protect, requireOrganization, updateProject)
    .delete(protect, requireOrganization, deleteProject);

router.route('/:id/members')
    .post(protect, requireOrganization, addMember);

module.exports = router;
