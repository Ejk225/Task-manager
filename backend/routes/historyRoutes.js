const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { checkTaskPermission } = require('../middlewares/taskMiddleware');
const { getTaskHistory, getAttachmentHistory } = require('../controllers/historyController');

router.get('/tasks/:id/history', authenticate, checkTaskPermission, getTaskHistory);
router.get('/tasks/:id/history/attachments', authenticate, checkTaskPermission, getAttachmentHistory);

module.exports = router;