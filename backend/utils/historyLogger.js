const { TaskHistory } = require('../models');

/**
 * Enregistre un changement simple (compatible avec l'existant)
 */
async function logSimpleChange(idTache, idUtilisateur, champ, ancienneValeur, nouvelleValeur) {
  return TaskHistory.create({
    id_tache: idTache,
    id_utilisateur: idUtilisateur,
    champ_modifie: champ,
    ancienne_valeur: ancienneValeur,
    nouvelle_valeur: nouvelleValeur
  });
}

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

module.exports = { logSimpleChange, logComplexEvent };