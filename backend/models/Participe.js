const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Participe = sequelize.define('Participe', {
  id_utilisateur: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  id_projet: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  role: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'membre',
    validate: {
      isIn: {
        args: [['proprietaire', 'membre', 'invite']],
        msg: 'Rôle invalide'
      }
    }
  },
  date_ajout: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Participe',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  freezeTableName: true
});

module.exports = Participe;