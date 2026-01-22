const { Project, User, Participe, sequelize } = require('../models');

// Ajouter un membre au projet
const addMember = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const projectId = req.params.id;
    const { email } = req.body;
    const currentUserId = req.user.id;

    // Validation
    if (!email) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'L\'email du membre est requis'
      });
    }

    // Récupérer le projet
    const project = await Project.findByPk(projectId);
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Vérifier que l'utilisateur actuel est le créateur
    if (!project.isOwner(currentUserId)) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Seul le créateur peut inviter des membres'
      });
    }

    // Trouver l'utilisateur à ajouter
    const userToAdd = await User.findOne({ where: { email } });
    if (!userToAdd) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé avec cet email'
      });
    }

    // Vérifier si l'utilisateur est déjà membre
    const existingMember = await Participe.findOne({
      where: {
        id_utilisateur: userToAdd.id_utilisateur,
        id_projet: projectId
      },
      transaction
    });

    if (existingMember) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: 'Cet utilisateur est déjà membre du projet'
      });
    }

    // Ajouter le membre
    await Participe.create({
      id_utilisateur: userToAdd.id_utilisateur,
      id_projet: projectId
    }, { transaction });

    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Membre ajouté avec succès',
      data: {
        id_utilisateur: userToAdd.id_utilisateur,
        nom: userToAdd.nom,
        email: userToAdd.email,
        role: userToAdd.role
      }
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erreur ajout membre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'ajout du membre',
      error: error.message
    });
  }
};

// Récupérer tous les membres d'un projet
const getMembers = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;

    // Vérifier que le projet existe
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Récupérer tous les membres avec leurs infos
    const members = await sequelize.query(
      `SELECT u.id_utilisateur, u.nom, u.email, u.role, p.date_ajout,
       CASE WHEN u.id_utilisateur = ? THEN true ELSE false END as is_owner
       FROM "Participe" p
       JOIN "Utilisateur" u ON p.id_utilisateur = u.id_utilisateur
       WHERE p.id_projet = ?
       ORDER BY p.date_ajout ASC`,
      {
        replacements: [project.id_utilisateur_createur, projectId],
        type: sequelize.QueryTypes.SELECT
      }
    );

    // Ajouter le créateur s'il n'est pas déjà dans la liste
    const creatorInList = members.some(m => m.id_utilisateur === project.id_utilisateur_createur);
    
    if (!creatorInList) {
      const creator = await User.findByPk(project.id_utilisateur_createur);
      if (creator) {
        members.unshift({
          id_utilisateur: creator.id_utilisateur,
          nom: creator.nom,
          email: creator.email,
          role: creator.role,
          date_ajout: project.date_creation,
          is_owner: true
        });
      }
    }

    res.status(200).json({
      success: true,
      data: members,
      count: members.length
    });

  } catch (error) {
    console.error('Erreur récupération membres:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des membres',
      error: error.message
    });
  }
};

// Retirer un membre du projet
const removeMember = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const projectId = req.params.id;
    const memberIdToRemove = req.params.userId;
    const currentUserId = req.user.id;

    // Récupérer le projet
    const project = await Project.findByPk(projectId);
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Vérifier que l'utilisateur actuel est le créateur
    if (!project.isOwner(currentUserId)) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Seul le créateur peut retirer des membres'
      });
    }

    // Empêcher de retirer le créateur
    if (parseInt(memberIdToRemove) === project.id_utilisateur_createur) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Impossible de retirer le créateur du projet'
      });
    }

    // Vérifier que le membre existe dans le projet
    const memberExists = await Participe.findOne({
      where: {
        id_utilisateur: memberIdToRemove,
        id_projet: projectId
      },
      transaction
    });

    if (!memberExists) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Ce membre ne fait pas partie du projet'
      });
    }

    // Retirer le membre
    await Participe.destroy({
      where: {
        id_utilisateur: memberIdToRemove,
        id_projet: projectId
      },
      transaction
    });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Membre retiré avec succès'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erreur retrait membre:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du retrait du membre',
      error: error.message
    });
  }
};

// Quitter un projet (pour un membre non-créateur)
const leaveProject = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const projectId = req.params.id;
    const currentUserId = req.user.id;

    // Récupérer le projet
    const project = await Project.findByPk(projectId);
    if (!project) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Projet non trouvé'
      });
    }

    // Empêcher le créateur de quitter son propre projet
    if (project.isOwner(currentUserId)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Le créateur ne peut pas quitter son projet. Supprimez-le si vous souhaitez le retirer.'
      });
    }

    // Vérifier que l'utilisateur est membre
    const isMember = await Participe.findOne({
      where: {
        id_utilisateur: currentUserId,
        id_projet: projectId
      },
      transaction
    });

    if (!isMember) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Vous ne faites pas partie de ce projet'
      });
    }

    // Quitter le projet
    await Participe.destroy({
      where: {
        id_utilisateur: currentUserId,
        id_projet: projectId
      },
      transaction
    });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Vous avez quitté le projet avec succès'
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Erreur quitter projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sortie du projet',
      error: error.message
    });
  }
};

module.exports = {
  addMember,
  getMembers,
  removeMember,
  leaveProject
};