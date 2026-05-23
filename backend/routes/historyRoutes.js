const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { checkTaskPermission } = require('../middlewares/taskMiddleware');
const { getTaskHistory } = require('../controllers/historyController');

router.get('/tasks/:id/history', authenticate, checkTaskPermission, getTaskHistory);

module.exports = router;