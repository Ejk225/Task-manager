const { TaskHistory } = require('../models');

/**
 * Enregistre un événement complexe via la colonne JSONB
 */
async function logComplexEvent(idTache, idUtilisateur, typeEvenement, payload) {
  return TaskHistory.create({
    id_tache: idTache,
    id_utilisateur: idUtilisateur,
    champ_modifie: typeEvenement, // ex: "piece_jointe", "reassignation"
    details: {
      type: typeEvenement,
      ...payload
    }
  });
}

module.exports = { logComplexEvent };