const Project = require('../models/Project');

// Middleware pour vérifier que l'utilisateur est le propriétaire du projet
const checkProjectOwnership = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Récupérer le projet
    const project = await Project.findByPk(projectId);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Vérifier que l'utilisateur est le créateur
    if (!project.isOwner(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Seul le créateur peut effectuer cette action.'
      });
    }

    // Attacher le projet à la requête pour éviter une nouvelle recherche
    req.project = project;
    next();

  } catch (error) {
    console.error('Erreur vérification ownership:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification des permissions',
      error: error.message
    });
  }
};

// Middleware pour vérifier que l'utilisateur est membre du projet
const checkProjectMembership = async (req, res, next) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Récupérer le projet avec ses membres
    const project = await Project.findByPk(projectId, {
      include: [{
        model: require('./User'),
        as: 'membres',
        through: { attributes: [] }
      }]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Vérifier si l'utilisateur est membre ou créateur
    const isMember = project.membres.some(membre => membre.id_utilisateur === userId);
    const isOwner = project.isOwner(userId);

    if (!isMember && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous n\'êtes pas membre de ce projet.'
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

module.exports = {
  checkProjectOwnership,
  checkProjectMembership
};