const { Task, Project, Participe } = require('../models');

// Middleware pour vérifier que l'utilisateur est membre du projet
const checkProjectMembership = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.id_projet;
    const userId = req.user.id;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: 'ID du projet requis'
      });
    }

    // Vérifier si l'utilisateur est membre du projet
    const isMember = await Participe.findOne({
      where: {
        id_utilisateur: userId,
        id_projet: projectId
      }
    });

    // Vérifier si l'utilisateur est le créateur du projet
    const project = await Project.findByPk(projectId);
    const isOwner = project && project.id_utilisateur_createur === userId;

    if (!isMember && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Vous n\'êtes pas membre de ce projet'
      });
    }

    req.project = project;
    next();

  } catch (error) {
    console.error('Erreur vérification membership:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions',
      error: error.message
    });
  }
};

// Middleware pour vérifier les permissions sur une tâche
const checkTaskPermission = async (req, res, next) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    // Récupérer la tâche avec son projet
    const task = await Task.findByPk(taskId, {
      include: [{
        model: Project,
        as: 'projet'
      }]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Tâche non trouvée'
      });
    }

    // Vérifier que l'utilisateur est membre du projet
    const isMember = await Participe.findOne({
      where: {
        id_utilisateur: userId,
        id_projet: task.id_projet
      }
    });

    const isOwner = task.projet.id_utilisateur_createur === userId;

    if (!isMember && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous n\'êtes pas membre de ce projet.'
      });
    }

    req.task = task;
    next();

  } catch (error) {
    console.error('Erreur vérification permission tâche:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions',
      error: error.message
    });
  }
};

module.exports = {
  checkProjectMembership,
  checkTaskPermission
};