const User = require('./User');
const Project = require('./Project');
const Participe = require('./Participe');
const Task = require('./Task');
const { sequelize } = require('../config/database');

// Définir les relations

// Un utilisateur peut créer plusieurs projets
User.hasMany(Project, {
  foreignKey: 'id_utilisateur_createur',
  as: 'projets_crees'
});

// Un projet appartient à un créateur
Project.belongsTo(User, {
  foreignKey: 'id_utilisateur_createur',
  as: 'createur'
});

// Relation many-to-many : Utilisateurs <-> Projets (via table Participe)
User.belongsToMany(Project, {
  through: Participe,
  foreignKey: 'id_utilisateur',
  otherKey: 'id_projet',
  as: 'projets'
});

Project.belongsToMany(User, {
  through: Participe,
  foreignKey: 'id_projet',
  otherKey: 'id_utilisateur',
  as: 'membres'
});

// Relations pour les tâches
Project.hasMany(Task, {
  foreignKey: 'id_projet',
  as: 'taches'
});

Task.belongsTo(Project, {
  foreignKey: 'id_projet',
  as: 'projet'
});

User.hasMany(Task, {
  foreignKey: 'id_utilisateur_assigne',
  as: 'taches_assignees'
});

Task.belongsTo(User, {
  foreignKey: 'id_utilisateur_assigne',
  as: 'utilisateur_assigne'
});

module.exports = {
  sequelize,
  User,
  Project,
  Participe,
  Task
};