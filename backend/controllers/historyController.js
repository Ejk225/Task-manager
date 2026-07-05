const { TaskHistory, User } = require('../models');

// GET /api/tasks/:id/history
const getTaskHistory = async (req, res) => {
  try {
    const taskId = req.params.id;

    const history = await TaskHistory.findAll({
      where: { id_tache: taskId },
      include: [{
        model: User,
        as: 'modificateur',
        attributes: ['id_utilisateur', 'nom', 'email']
      }],
      order: [['date_modification', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: history.map(h => h.toSafeObject()),
      count: history.length
    });

  } catch (error) {
    console.error('Erreur récupération historique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message
    });
  }
};

const { Op, literal } = require('sequelize');

// GET /api/tasks/:id/history/attachments
// Filtre DIRECTEMENT dans le contenu JSON (opérateur ->>)
const getAttachmentHistory = async (req, res) => {
  try {
    const taskId = req.params.id;

    const history = await TaskHistory.findAll({
      where: {
        id_tache: taskId,
        [Op.and]: literal(`details->>'type' = 'piece_jointe'`)
      },
      order: [['date_modification', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: history.map(h => h.toSafeObject()),
      count: history.length
    });

  } catch (error) {
    console.error('Erreur récupération historique pièces jointes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message
    });
  }
};

module.exports = { getTaskHistory, getAttachmentHistory };