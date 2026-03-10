const { Task, User, Project } = require('../models');

// Créer une nouvelle tâche
const createTask = async (req, res) => {
  try {
    const { titre, description, statut, priorite, date_echeance, id_utilisateur_assigne } = req.body;
    const projectId = req.params.projectId;
    const userId = req.user.id;

    // Validation
    if (!titre) {
      return res.status(400).json({
        success: false,
        message: 'Le titre de la tâche est requis'
      });
    }

    // Créer la tâche
    const newTask = await Task.create({
      titre,
      description,
      statut: statut || 'a_faire',
      priorite: priorite || 'moyenne',
      date_echeance,
      id_projet: projectId,
      id_utilisateur_assigne: id_utilisateur_assigne || null
    });

    // Récupérer la tâche avec les relations
    const taskWithRelations = await Task.findByPk(newTask.id_tache, {
      include: [
        {
          model: User,
          as: 'utilisateur_assigne',
          attributes: ['id_utilisateur', 'nom', 'email']
        },
        {
          model: Project,
          as: 'projet',
          attributes: ['id_projet', 'nom']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Tâche créée avec succès',
      data: taskWithRelations.toSafeObject()
    });

  } catch (error) {
    console.error('Erreur création tâche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la tâche',
      error: error.message
    });
  }
};

// Récupérer toutes les tâches d'un projet
const getTasksByProject = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { statut, priorite, assignee, search } = req.query;

    // Construire les filtres
    const where = { id_projet: projectId };

    if (statut) {
      where.statut = statut;
    }

    if (priorite) {
      where.priorite = priorite;
    }

    if (assignee === 'unassigned') {
      where.id_utilisateur_assigne = null;
    } else if (assignee === 'me') {
      where.id_utilisateur_assigne = req.user.id;
    } else if (assignee && !isNaN(assignee)) {
      where.id_utilisateur_assigne = parseInt(assignee);
    }

    // Recherche textuelle
    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { titre: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Récupérer les tâches
    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: 'utilisateur_assigne',
          attributes: ['id_utilisateur', 'nom', 'email']
        }
      ],
      order: [
        ['date_creation', 'DESC']
      ]
    });

    // Formater les tâches
    const formattedTasks = tasks.map(task => task.toSafeObject());

    res.status(200).json({
      success: true,
      data: formattedTasks,
      count: formattedTasks.length
    });

  } catch (error) {
    console.error('Erreur récupération tâches:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des tâches',
      error: error.message
    });
  }
};

// Récupérer une tâche par ID
const getTaskById = async (req, res) => {
  try {
    const task = req.task; // Injecté par le middleware

    // Recharger avec toutes les relations
    const taskWithRelations = await Task.findByPk(task.id_tache, {
      include: [
        {
          model: User,
          as: 'utilisateur_assigne',
          attributes: ['id_utilisateur', 'nom', 'email', 'role']
        },
        {
          model: Project,
          as: 'projet',
          attributes: ['id_projet', 'nom', 'description']
        }
      ]
    });

    res.status(200).json({
      success: true,
      data: taskWithRelations.toSafeObject()
    });

  } catch (error) {
    console.error('Erreur récupération tâche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la tâche',
      error: error.message
    });
  }
};

// Modifier une tâche
const updateTask = async (req, res) => {
  try {
    const task = req.task; // Injecté par le middleware
    const { titre, description, statut, priorite, date_echeance, id_utilisateur_assigne } = req.body;

    // Validation
    if (titre !== undefined && !titre.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Le titre ne peut pas être vide'
      });
    }

    // Mise à jour
    await task.update({
      titre: titre !== undefined ? titre : task.titre,
      description: description !== undefined ? description : task.description,
      statut: statut !== undefined ? statut : task.statut,
      priorite: priorite !== undefined ? priorite : task.priorite,
      date_echeance: date_echeance !== undefined ? date_echeance : task.date_echeance,
      id_utilisateur_assigne: id_utilisateur_assigne !== undefined ? id_utilisateur_assigne : task.id_utilisateur_assigne
    });

    // Recharger avec relations
    const updatedTask = await Task.findByPk(task.id_tache, {
      include: [
        {
          model: User,
          as: 'utilisateur_assigne',
          attributes: ['id_utilisateur', 'nom', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Tâche modifiée avec succès',
      data: updatedTask.toSafeObject()
    });

  } catch (error) {
    console.error('Erreur modification tâche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de la tâche',
      error: error.message
    });
  }
};

// Supprimer une tâche
const deleteTask = async (req, res) => {
  try {
    const task = req.task; // Injecté par le middleware

    await task.destroy();

    res.status(200).json({
      success: true,
      message: 'Tâche supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression tâche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la tâche',
      error: error.message
    });
  }
};

// Assigner une tâche
const assignTask = async (req, res) => {
  try {
    const task = req.task;
    const { id_utilisateur_assigne } = req.body;

    // Si null, on désassigne
    await task.update({
      id_utilisateur_assigne: id_utilisateur_assigne || null
    });

    // Recharger avec relations
    const updatedTask = await Task.findByPk(task.id_tache, {
      include: [
        {
          model: User,
          as: 'utilisateur_assigne',
          attributes: ['id_utilisateur', 'nom', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: id_utilisateur_assigne ? 'Tâche assignée avec succès' : 'Tâche désassignée avec succès',
      data: updatedTask.toSafeObject()
    });

  } catch (error) {
    console.error('Erreur assignation tâche:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'assignation de la tâche',
      error: error.message
    });
  }
};

// Changer le statut d'une tâche
const updateTaskStatus = async (req, res) => {
  try {
    const task = req.task;
    const { statut } = req.body;

    // Validation
    const validStatuts = ['a_faire', 'en_cours', 'terminee', 'archivee'];
    if (!validStatuts.includes(statut)) {
      return res.status(400).json({
        success: false,
        message: 'Statut invalide'
      });
    }

    await task.update({ statut });

    // Recharger avec relations
    const updatedTask = await Task.findByPk(task.id_tache, {
      include: [
        {
          model: User,
          as: 'utilisateur_assigne',
          attributes: ['id_utilisateur', 'nom', 'email']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Statut modifié avec succès',
      data: updatedTask.toSafeObject()
    });

  } catch (error) {
    console.error('Erreur changement statut:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du changement de statut',
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  updateTaskStatus
};