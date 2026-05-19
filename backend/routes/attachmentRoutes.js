const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { checkTaskPermission } = require('../middlewares/taskMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const {
  uploadAttachment,
  getAttachments,
  downloadAttachment,
  deleteAttachment
} = require('../controllers/attachmentController');

// Upload fichiers sur une tâche (max 5 fichiers)
router.post('/tasks/:id/attachments', authenticate, checkTaskPermission, upload.array('files', 5), uploadAttachment);

// Lister les pièces jointes d'une tâche
router.get('/tasks/:id/attachments', authenticate, checkTaskPermission, getAttachments);

// Télécharger un fichier
router.get('/attachments/:id/download', authenticate, downloadAttachment);

// Supprimer un fichier
router.delete('/attachments/:id', authenticate, deleteAttachment);

module.exports = router;