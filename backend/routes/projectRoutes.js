const express = require('express');
const router = express.Router();
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const { authenticate } = require('../middlewares/authMiddleware');
const { checkProjectOwnership } = require('../middlewares/projectMiddleware');

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Routes CRUD
router.post('/', createProject);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.put('/:id', checkProjectOwnership, updateProject);
router.delete('/:id', checkProjectOwnership, deleteProject);

module.exports = router;