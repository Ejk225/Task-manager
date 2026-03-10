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

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Routes pour les tâches d'un projet
router.post('/projects/:projectId/tasks', checkProjectMembership, createTask);
router.get('/projects/:projectId/tasks', checkProjectMembership, getTasksByProject);

// Routes pour une tâche spécifique
router.get('/tasks/:id', checkTaskPermission, getTaskById);
router.put('/tasks/:id', checkTaskPermission, updateTask);
router.delete('/tasks/:id', checkTaskPermission, deleteTask);
router.put('/tasks/:id/assign', checkTaskPermission, assignTask);
router.put('/tasks/:id/status', checkTaskPermission, updateTaskStatus);

module.exports = router;