const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const TaskHistory = sequelize.define('HistoriqueTache', {
  id_historique: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  champ_modifie: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  ancienne_valeur: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  nouvelle_valeur: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // --- Nouvelle colonne : document JSON à structure variable ---
  details: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Document JSON pour les événements complexes (pièce jointe, réassignation) ne rentrant pas dans le format champ/ancienne_valeur/nouvelle_valeur'
  },
  date_modification: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  id_tache: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Tache', key: 'id_tache' }
  },
  id_utilisateur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'Utilisateur', key: 'id_utilisateur' }
  }
}, {
  tableName: 'HistoriqueTache',
  timestamps: false,
  freezeTableName: true
});

TaskHistory.prototype.toSafeObject = function () {
  return this.toJSON();
};

module.exports = TaskHistory;