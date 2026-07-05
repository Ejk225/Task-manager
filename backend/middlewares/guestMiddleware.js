const { Participe } = require('../models');

const blockGuests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    let projectId = null;
    if (req.task) {
      projectId = req.task.id_projet;
    } else if (req.project) {
      projectId = req.project.id_projet;
    } else {
      projectId = req.params.projectId || req.body.id_projet;
    }

    // --- LOG TEMPORAIRE DE DIAGNOSTIC ---
    console.log('[DEBUG blockGuests]', {
      userId,
      projectId,
      hasReqTask: !!req.task,
      reqTaskIdProjet: req.task?.id_projet,
      route: req.originalUrl
    });

    if (!projectId) return next();

    const participation = await Participe.findOne({
      where: {
        id_utilisateur: userId,
        id_projet: projectId
      }
    });

    console.log('[DEBUG blockGuests] participation trouvée:', participation ? participation.toJSON() : null);
    // --- FIN LOG TEMPORAIRE ---

    if (!participation) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    if (participation.role === 'invite') {
      return res.status(403).json({
        success: false,
        message: 'Les invités ne peuvent pas effectuer cette action'
      });
    }

    next();
  } catch (error) {
    console.error('Erreur guestMiddleware:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
      error: error.message
    });
  }
};

module.exports = { blockGuests };