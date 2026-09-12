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
const { checkProjectMembership, checkTaskPermission, checkTaskOwnership } = require('../middlewares/taskMiddleware');
const { blockGuests } = require('../middlewares/guestMiddleware');

router.use(authenticate);

// Lecture — accessible aux invités
router.get('/projects/:projectId/tasks', checkProjectMembership, getTasksByProject);
router.get('/tasks/:id', checkTaskPermission, getTaskById);

// Écriture — bloqué pour les invités
router.post('/projects/:projectId/tasks', checkProjectMembership, blockGuests, createTask);
router.put('/tasks/:id', checkTaskPermission, blockGuests, checkTaskOwnership, updateTask);
router.delete('/tasks/:id', checkTaskPermission, blockGuests, checkTaskOwnership, deleteTask);
router.put('/tasks/:id/assign', checkTaskPermission, blockGuests, checkTaskOwnership, assignTask);
router.put('/tasks/:id/status', checkTaskPermission, blockGuests, checkTaskOwnership, updateTaskStatus);

module.exports = router;