const { User, Project, Task, Participe, sequelize } = require('../models');
const { Op } = require('sequelize');

// GET /api/stats/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Projets de l'utilisateur (créés OU membre)
    const userProjects = await Project.findAll({
      include: [{
        model: User,
        as: 'membres',
        where: { id_utilisateur: userId },
        attributes: [],
        through: { attributes: [] }
      }],
      attributes: ['id_projet']
    });

    const projectIds = userProjects.map(p => p.id_projet);

    // Stats tâches globales sur ces projets
    const tasks = await Task.findAll({
      where: { id_projet: { [Op.in]: projectIds } },
      attributes: ['statut', 'priorite', 'date_echeance', 'id_projet', 'titre', 'date_creation', 'id_tache']
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks_total = tasks.length;
    const tasks_completed = tasks.filter(t => t.statut === 'terminee').length;
    const tasks_in_progress = tasks.filter(t => t.statut === 'en_cours').length;
    const tasks_todo = tasks.filter(t => t.statut === 'a_faire').length;
    const tasks_overdue = tasks.filter(t => {
      if (!t.date_echeance) return false;
      return new Date(t.date_echeance) < today &&
        t.statut !== 'terminee' && t.statut !== 'archivee';
    }).length;

    const completion_rate = tasks_total > 0
      ? Math.round((tasks_completed / tasks_total) * 100 * 10) / 10
      : 0;

    // Tâches par priorité
    const tasks_by_priority = {
      urgente: tasks.filter(t => t.priorite === 'urgente').length,
      haute: tasks.filter(t => t.priorite === 'haute').length,
      moyenne: tasks.filter(t => t.priorite === 'moyenne').length,
      basse: tasks.filter(t => t.priorite === 'basse').length
    };

    // Tâches par projet (top 5)
    const projectsWithNames = await Project.findAll({
      where: { id_projet: { [Op.in]: projectIds } },
      attributes: ['id_projet', 'nom']
    });

    const tasks_by_project = projectsWithNames.map(p => ({
      project_name: p.nom,
      count: tasks.filter(t => t.id_projet === p.id_projet).length
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

    // 5 tâches récentes
    const recent_tasks = await Task.findAll({
      where: { id_projet: { [Op.in]: projectIds } },
      include: [{
        model: Project,
        as: 'projet',
        attributes: ['nom']
      }],
      order: [['date_creation', 'DESC']],
      limit: 5,
      attributes: ['id_tache', 'titre', 'statut', 'priorite', 'date_creation', 'id_projet']
    });

    res.status(200).json({
      success: true,
      data: {
        projects_count: projectIds.length,
        tasks_total,
        tasks_completed,
        tasks_in_progress,
        tasks_todo,
        tasks_overdue,
        completion_rate,
        tasks_by_priority,
        tasks_by_project,
        recent_tasks: recent_tasks.map(t => t.toSafeObject())
      }
    });

  } catch (error) {
    console.error('Erreur stats dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
};

// GET /api/stats/projects/:id
const getProjectStats = async (req, res) => {
  try {
    const projectId = req.params.id;

    const project = await Project.findByPk(projectId, {
      include: [{ model: User, as: 'membres', attributes: ['id_utilisateur', 'nom', 'email'] }]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Projet introuvable' });
    }

    const tasks = await Task.findAll({
      where: { id_projet: projectId },
      attributes: ['statut', 'priorite', 'date_echeance']
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks_total = tasks.length;
    const tasks_completed = tasks.filter(t => t.statut === 'terminee').length;
    const tasks_in_progress = tasks.filter(t => t.statut === 'en_cours').length;
    const tasks_todo = tasks.filter(t => t.statut === 'a_faire').length;
    const tasks_archived = tasks.filter(t => t.statut === 'archivee').length;
    const tasks_overdue = tasks.filter(t => {
      if (!t.date_echeance) return false;
      return new Date(t.date_echeance) < today &&
        t.statut !== 'terminee' && t.statut !== 'archivee';
    }).length;

    const completion_rate = tasks_total > 0
      ? Math.round((tasks_completed / tasks_total) * 100 * 10) / 10
      : 0;

    res.status(200).json({
      success: true,
      data: {
        project_name: project.nom,
        members_count: project.membres.length,
        tasks_total,
        tasks_completed,
        tasks_in_progress,
        tasks_todo,
        tasks_archived,
        tasks_overdue,
        completion_rate,
        tasks_by_priority: {
          urgente: tasks.filter(t => t.priorite === 'urgente').length,
          haute: tasks.filter(t => t.priorite === 'haute').length,
          moyenne: tasks.filter(t => t.priorite === 'moyenne').length,
          basse: tasks.filter(t => t.priorite === 'basse').length
        }
      }
    });

  } catch (error) {
    console.error('Erreur stats projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors des statistiques du projet',
      error: error.message
    });
  }
};

module.exports = { getDashboardStats, getProjectStats };