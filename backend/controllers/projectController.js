const { Project, User, Participe } = require('../models');
const { sequelize } = require('../config/database');

// Créer un nouveau projet
const createProject = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { nom, description } = req.body;
    const userId = req.user.id;

    // Validation
    if (!nom) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Le nom du projet est requis'
      });
    }

    // Créer le projet
    const newProject = await Project.create({
      nom,
      description,
      id_utilisateur_createur: userId
    }, { transaction });

    // Ajouter automatiquement le créateur comme membre
    await Participe.create({
      id_utilisateur: userId,
      id_projet: newProject.id_projet
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      data: newProject.toSafeObject()
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erreur création projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet',
      error: error.message
    });
  }
};

// Récupérer tous les projets de l'utilisateur
const getAllProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // Récupérer tous les projets où l'utilisateur est membre ou créateur
    const projects = await sequelize.query(
      `SELECT DISTINCT p.*, u.nom as createur_nom, u.email as createur_email,
       (SELECT COUNT(*) FROM "Participe" WHERE id_projet = p.id_projet) as nombre_membres
       FROM "Projet" p
       LEFT JOIN "Utilisateur" u ON p.id_utilisateur_createur = u.id_utilisateur
       LEFT JOIN "Participe" part ON p.id_projet = part.id_projet
       WHERE p.id_utilisateur_createur = ? OR part.id_utilisateur = ?
       ORDER BY p.date_creation DESC`,
      {
        replacements: [userId, userId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    res.status(200).json({
      success: true,
      data: projects,
      count: projects.length
    });

  } catch (error) {
    console.error('Erreur récupération projets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets',
      error: error.message
    });
  }
};

// Récupérer un projet par ID
const getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Récupérer le projet avec le créateur et les membres
    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: User,
          as: 'createur',
          attributes: ['id_utilisateur', 'nom', 'email', 'role']
        },
        {
          model: User,
          as: 'membres',
          attributes: ['id_utilisateur', 'nom', 'email', 'role'],
          through: { attributes: ['date_ajout'] }
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Vérifier que l'utilisateur est membre ou créateur
    const isMember = project.membres.some(m => m.id_utilisateur === userId);
    const isOwner = project.isOwner(userId);

    if (!isMember && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Vous n\'êtes pas membre de ce projet.'
      });
    }

    res.status(200).json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Erreur récupération projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du projet',
      error: error.message
    });
  }
};

// Modifier un projet
const updateProject = async (req, res) => {
  try {
    const { nom, description } = req.body;
    const project = req.project; // Injecté par le middleware

    // Validation
    if (!nom) {
      return res.status(400).json({
        success: false,
        message: 'Le nom du projet est requis'
      });
    }

    // Mise à jour
    await project.update({
      nom,
      description
    });

    res.status(200).json({
      success: true,
      message: 'Projet modifié avec succès',
      data: project.toSafeObject()
    });

  } catch (error) {
    console.error('Erreur modification projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification du projet',
      error: error.message
    });
  }
};

// Supprimer un projet
const deleteProject = async (req, res) => {
  try {
    const project = req.project; // Injecté par le middleware

    await project.destroy();

    res.status(200).json({
      success: true,
      message: 'Projet supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du projet',
      error: error.message
    });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
};