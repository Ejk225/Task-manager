const { Comment, User, Task, Participe } = require('../models');

// Vérifier que l'utilisateur est membre du projet de la tâche
const checkProjectMembership = async (userId, task) => {
  const participation = await Participe.findOne({
    where: {
      id_utilisateur: userId,
      id_projet: task.id_projet
    }
  });
  return !!participation;
};

// POST /api/tasks/:taskId/comments
const addComment = async (req, res) => {
  try {
    const { contenu } = req.body;
    const taskId = req.params.taskId;
    const userId = req.user.id;

    if (!contenu || !contenu.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Le contenu du commentaire est requis'
      });
    }

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    }

    // Vérifier que l'utilisateur est membre du projet
    const isMember = await checkProjectMembership(userId, task);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Vous devez être membre du projet pour commenter'
      });
    }

    const comment = await Comment.create({
      contenu: contenu.trim(),
      id_tache: taskId,
      id_utilisateur: userId
    });

    // Recharger avec l'auteur
    const commentWithAuthor = await Comment.findByPk(comment.id_commentaire, {
      include: [{
        model: User,
        as: 'auteur',
        attributes: ['id_utilisateur', 'nom', 'email']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Commentaire ajouté avec succès',
      data: commentWithAuthor.toSafeObject()
    });

  } catch (error) {
    console.error('Erreur ajout commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du commentaire',
      error: error.message
    });
  }
};

// GET /api/tasks/:taskId/comments
const getCommentsByTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Tâche introuvable' });
    }

    const comments = await Comment.findAll({
      where: { id_tache: taskId },
      include: [{
        model: User,
        as: 'auteur',
        attributes: ['id_utilisateur', 'nom', 'email']
      }],
      order: [['date_commentaire', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: comments.map(c => c.toSafeObject()),
      count: comments.length
    });

  } catch (error) {
    console.error('Erreur récupération commentaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commentaires',
      error: error.message
    });
  }
};

// PUT /api/comments/:id
const updateComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;
    const { contenu } = req.body;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Commentaire introuvable' });
    }

    // Seul l'auteur peut modifier
    if (comment.id_utilisateur !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez modifier que vos propres commentaires'
      });
    }

    if (!contenu || !contenu.trim()) {
      return res.status(400).json({ success: false, message: 'Le contenu est requis' });
    }

    await comment.update({ contenu: contenu.trim() });

    const updated = await Comment.findByPk(commentId, {
      include: [{
        model: User,
        as: 'auteur',
        attributes: ['id_utilisateur', 'nom', 'email']
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Commentaire modifié avec succès',
      data: updated.toSafeObject()
    });

  } catch (error) {
    console.error('Erreur modification commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du commentaire',
      error: error.message
    });
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id;

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Commentaire introuvable' });
    }

    // Seul l'auteur peut supprimer
    if (comment.id_utilisateur !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Vous ne pouvez supprimer que vos propres commentaires'
      });
    }

    await comment.destroy();

    res.status(200).json({
      success: true,
      message: 'Commentaire supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du commentaire',
      error: error.message
    });
  }
};

module.exports = { addComment, getCommentsByTask, updateComment, deleteComment };