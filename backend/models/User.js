const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('Utilisateur', {
  id_utilisateur: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'id_utilisateur'
  },
  nom: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le nom est requis' },
      len: {
        args: [2, 100],
        msg: 'Le nom doit contenir entre 2 et 100 caractères'
      }
    }
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: {
      msg: 'Cet email est déjà utilisé'
    },
    validate: {
      isEmail: { msg: 'Email invalide' },
      notEmpty: { msg: 'L\'email est requis' }
    }
  },
  mot_de_passe: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Le mot de passe est requis' },
      len: {
        args: [6, 255],
        msg: 'Le mot de passe doit contenir au moins 6 caractères'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'manager', 'membre'),
    defaultValue: 'membre',
    allowNull: false
  },
  date_creation: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'date_creation'
  }
}, {
  tableName: 'Utilisateur',
  timestamps: false,
  hooks: {
    // Hash du mot de passe avant création
    beforeCreate: async (user) => {
      if (user.mot_de_passe) {
        const salt = await bcrypt.genSalt(10);
        user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, salt);
      }
    },
    // Hash du mot de passe avant mise à jour
    beforeUpdate: async (user) => {
      if (user.changed('mot_de_passe')) {
        const salt = await bcrypt.genSalt(10);
        user.mot_de_passe = await bcrypt.hash(user.mot_de_passe, salt);
      }
    }
  }
});

// Méthode pour comparer les mots de passe
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.mot_de_passe);
};

// Méthode pour retourner l'utilisateur sans le mot de passe
User.prototype.toSafeObject = function() {
  const { mot_de_passe, ...userWithoutPassword } = this.toJSON();
  return userWithoutPassword;
};

module.exports = User;