const express = require('express');
const router = express.Router();
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
const {
  addMember,
  getMembers,
  removeMember,
  leaveProject
} = require('../controllers/memberController');
const { authenticate } = require('../middlewares/authMiddleware');
const { checkProjectOwnership } = require('../middlewares/projectMiddleware');

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

// Routes CRUD Projets
router.post('/', createProject);
router.get('/', getAllProjects);
router.get('/:id', getProjectById);
router.put('/:id', checkProjectOwnership, updateProject);
router.delete('/:id', checkProjectOwnership, deleteProject);

// Routes Gestion des Membres
router.post('/:id/members', addMember);
router.get('/:id/members', getMembers);
router.delete('/:id/members/:userId', removeMember);
router.post('/:id/leave', leaveProject);

module.exports = router;