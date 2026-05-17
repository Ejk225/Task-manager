const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { getDashboardStats, getProjectStats } = require('../controllers/statsController');

router.get('/dashboard', authenticate, getDashboardStats);
router.get('/projects/:id', authenticate, getProjectStats);

module.exports = router;