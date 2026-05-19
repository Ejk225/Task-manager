const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attachment = sequelize.define('PieceJointe', {
  id_piece_jointe: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nom_fichier: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  nom_original: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type_mime: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  taille: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  chemin: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  date_upload: {
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
  tableName: 'PieceJointe',
  timestamps: false,
  freezeTableName: true
});

Attachment.prototype.toSafeObject = function () {
  return this.toJSON();
};

module.exports = Attachment;