const path = require('path');
const fs = require('fs');
const { Attachment, User, Task, Participe } = require('../models');

// POST /api/tasks/:id/attachments
const uploadAttachment = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier reçu'
      });
    }

    // Créer une entrée en base pour chaque fichier
    const attachments = await Promise.all(
      req.files.map(file =>
        Attachment.create({
          nom_fichier: file.filename,
          nom_original: file.originalname,
          type_mime: file.mimetype,
          taille: file.size,
          chemin: file.path,
          id_tache: taskId,
          id_utilisateur: userId
        })
      )
    );

    // Recharger avec l'uploader
    const attachmentsWithUser = await Attachment.findAll({
      where: { id_tache: taskId, id_piece_jointe: attachments.map(a => a.id_piece_jointe) },
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id_utilisateur', 'nom', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: `${attachments.length} fichier(s) uploadé(s) avec succès`,
      data: attachmentsWithUser.map(a => a.toSafeObject())
    });

  } catch (error) {
    console.error('Erreur upload:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload',
      error: error.message
    });
  }
};

// GET /api/tasks/:id/attachments
const getAttachments = async (req, res) => {
  try {
    const taskId = req.params.id;

    const attachments = await Attachment.findAll({
      where: { id_tache: taskId },
      include: [{
        model: User,
        as: 'uploader',
        attributes: ['id_utilisateur', 'nom', 'email']
      }],
      order: [['date_upload', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: attachments.map(a => a.toSafeObject()),
      count: attachments.length
    });

  } catch (error) {
    console.error('Erreur récupération pièces jointes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des pièces jointes',
      error: error.message
    });
  }
};

// GET /api/attachments/:id/download
const downloadAttachment = async (req, res) => {
  try {
    const attachment = await Attachment.findByPk(req.params.id);

    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Fichier introuvable' });
    }

    if (!fs.existsSync(attachment.chemin)) {
      return res.status(404).json({ success: false, message: 'Fichier non trouvé sur le serveur' });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${attachment.nom_original}"`);
    res.setHeader('Content-Type', attachment.type_mime);
    res.sendFile(path.resolve(attachment.chemin));

  } catch (error) {
    console.error('Erreur téléchargement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement',
      error: error.message
    });
  }
};

// DELETE /api/attachments/:id
const deleteAttachment = async (req, res) => {
  try {
    const attachmentId = req.params.id;
    const userId = req.user.id;

    const attachment = await Attachment.findByPk(attachmentId);

    if (!attachment) {
      return res.status(404).json({ success: false, message: 'Fichier introuvable' });
    }

    // Seul l'uploader peut supprimer
    if (attachment.id_utilisateur !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres fichiers'
      });
    }

    // Supprimer le fichier physique
    if (fs.existsSync(attachment.chemin)) {
      fs.unlinkSync(attachment.chemin);
    }

    await attachment.destroy();

    res.status(200).json({
      success: true,
      message: 'Fichier supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression pièce jointe:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message
    });
  }
};

module.exports = { uploadAttachment, getAttachments, downloadAttachment, deleteAttachment };