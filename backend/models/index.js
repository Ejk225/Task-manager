const User = require('./User');
const Project = require('./Project');
const Participe = require('./Participe');
const Task = require('./Task');
const Comment = require('./Comment');
const Attachment = require('./Attachment');  // ← manquait
const { sequelize } = require('../config/database');
const TaskHistory = require('./TaskHistory');

// Relations projets
User.hasMany(Project, {
  foreignKey: 'id_utilisateur_createur',
  as: 'projets_crees'
});
Project.belongsTo(User, {
  foreignKey: 'id_utilisateur_createur',
  as: 'createur'
});

// Many-to-many Utilisateurs <-> Projets
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

// Relations tâches
Project.hasMany(Task, { foreignKey: 'id_projet', as: 'taches' });
Task.belongsTo(Project, { foreignKey: 'id_projet', as: 'projet' });
User.hasMany(Task, { foreignKey: 'id_utilisateur_assigne', as: 'taches_assignees' });
Task.belongsTo(User, { foreignKey: 'id_utilisateur_assigne', as: 'utilisateur_assigne' });

// Relations commentaires
Task.hasMany(Comment, { foreignKey: 'id_tache', as: 'commentaires' });
Comment.belongsTo(Task, { foreignKey: 'id_tache', as: 'tache' });
User.hasMany(Comment, { foreignKey: 'id_utilisateur', as: 'commentaires' });
Comment.belongsTo(User, { foreignKey: 'id_utilisateur', as: 'auteur' });

// Relations pièces jointes  ← manquait
Task.hasMany(Attachment, { foreignKey: 'id_tache', as: 'pieces_jointes' });
Attachment.belongsTo(Task, { foreignKey: 'id_tache', as: 'tache' });
User.hasMany(Attachment, { foreignKey: 'id_utilisateur', as: 'pieces_jointes' });
Attachment.belongsTo(User, { foreignKey: 'id_utilisateur', as: 'uploader' });

// Relations historique
Task.hasMany(TaskHistory, {
  foreignKey: 'id_tache',
  as: 'historique'
});
TaskHistory.belongsTo(Task, {
  foreignKey: 'id_tache',
  as: 'tache'
});
User.hasMany(TaskHistory, {
  foreignKey: 'id_utilisateur',
  as: 'modifications'
});
TaskHistory.belongsTo(User, {
  foreignKey: 'id_utilisateur',
  as: 'modificateur'
});

module.exports = {
  sequelize,
  User,
  Project,
  Participe,
  Task,
  Comment,
  Attachment,
  TaskHistory
};