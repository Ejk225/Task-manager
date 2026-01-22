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
  date_ajout: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Participe',
  timestamps: true,           // ✅ OBLIGATOIRE
  createdAt: 'created_at',    // ✅ map DB
  updatedAt: 'updated_at',    // ✅ map DB
  freezeTableName: true
});



module.exports = Participe;