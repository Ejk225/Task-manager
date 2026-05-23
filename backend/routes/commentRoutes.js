const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { blockGuests } = require('../middlewares/guestMiddleware');
const {
  addComment,
  getCommentsByTask,
  updateComment,
  deleteComment
} = require('../controllers/commentController');

// Lecture — accessible aux invités
router.get('/tasks/:taskId/comments', authenticate, getCommentsByTask);

// Écriture — bloqué pour les invités
router.post('/tasks/:taskId/comments', authenticate, addComment);
router.put('/comments/:id', authenticate, blockGuests, updateComment);
router.delete('/comments/:id', authenticate, blockGuests, deleteComment);

module.exports = router;