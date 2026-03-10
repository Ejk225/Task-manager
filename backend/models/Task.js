const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Tache', {
  id_tache: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_tache'
  },
  titre: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le titre de la tâche est requis' },
      len: {
        args: [3, 200],
        msg: 'Le titre doit contenir entre 3 et 200 caractères'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  statut: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'a_faire',
    validate: {
      isIn: {
        args: [['a_faire', 'en_cours', 'terminee', 'archivee']],
        msg: 'Statut invalide'
      }
    }
  },
  priorite: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'moyenne',
    validate: {
      isIn: {
        args: [['basse', 'moyenne', 'haute', 'urgente']],
        msg: 'Priorité invalide'
      }
    }
  },
  date_echeance: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'date_echeance'
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'date_creation'
  },
  id_projet: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'id_projet',
    references: {
      model: 'Projet',
      key: 'id_projet'
    }
  },
  id_utilisateur_assigne: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'id_utilisateur_assigne',
    references: {
      model: 'Utilisateur',
      key: 'id_utilisateur'
    }
  }
}, {
  tableName: 'Tache',
  timestamps: false,
  freezeTableName: true
});

// Méthode pour vérifier si une tâche est en retard
Task.prototype.isOverdue = function() {
  if (!this.date_echeance) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const echeance = new Date(this.date_echeance);
  return echeance < today && this.statut !== 'terminee' && this.statut !== 'archivee';
};

// Méthode pour obtenir la tâche formatée
Task.prototype.toSafeObject = function() {
  const task = this.toJSON();
  task.is_overdue = this.isOverdue();
  return task;
};

module.exports = Task;