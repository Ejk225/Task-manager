const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Project = sequelize.define('Projet', {
  id_projet: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_projet'
  },
  nom: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom du projet est requis' },
      len: {
        args: [3, 200],
        msg: 'Le nom doit contenir entre 3 et 200 caractères'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'date_creation'
  },
  id_utilisateur_createur: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_utilisateur_createur',
    references: {
      model: 'Utilisateur',
      key: 'id_utilisateur'
    }
  }
}, {
  tableName: 'Projet',
  timestamps: false
});

// Méthode pour vérifier si un utilisateur est le créateur
Project.prototype.isOwner = function(userId) {
  return this.id_utilisateur_createur === userId;
};

// Méthode pour obtenir le projet sans données sensibles
Project.prototype.toSafeObject = function() {
  return this.toJSON();
};

module.exports = Project;