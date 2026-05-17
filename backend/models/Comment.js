const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Commentaire', {
  id_commentaire: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  contenu: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le commentaire ne peut pas être vide' },
      len: {
        args: [1, 2000],
        msg: 'Le commentaire doit contenir entre 1 et 2000 caractères'
      }
    }
  },
  date_commentaire: {
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
  tableName: 'Commentaire',
  timestamps: false,
  freezeTableName: true
});

Comment.prototype.toSafeObject = function () {
  return this.toJSON();
};

module.exports = Comment;