const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  updateTaskStatus
} = require('../controllers/taskController');
const { authenticate } = require('../middlewares/authMiddleware');
const { checkProjectMembership, checkTaskPermission } = require('../middlewares/taskMiddleware');
const { blockGuests } = require('../middlewares/guestMiddleware');

router.use(authenticate);

// Lecture — accessible aux invités
router.get('/projects/:projectId/tasks', checkProjectMembership, getTasksByProject);
router.get('/tasks/:id', checkTaskPermission, getTaskById);

// Écriture — bloqué pour les invités
router.post('/projects/:projectId/tasks', checkProjectMembership, blockGuests, createTask);
router.put('/tasks/:id', checkTaskPermission, blockGuests, updateTask);
router.delete('/tasks/:id', checkTaskPermission, blockGuests, deleteTask);
router.put('/tasks/:id/assign', checkTaskPermission, blockGuests, assignTask);
router.put('/tasks/:id/status', checkTaskPermission, blockGuests, updateTaskStatus);

module.exports = router;