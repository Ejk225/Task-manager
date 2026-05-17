const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const {
  addComment,
  getCommentsByTask,
  updateComment,
  deleteComment
} = require('../controllers/commentController');

// Routes commentaires sur une tâche
router.post('/tasks/:taskId/comments', authenticate, addComment);
router.get('/tasks/:taskId/comments', authenticate, getCommentsByTask);

// Routes sur un commentaire spécifique
router.put('/comments/:id', authenticate, updateComment);
router.delete('/comments/:id', authenticate, deleteComment);

module.exports = router;