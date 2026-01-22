const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtils');

// Inscription d'un nouvel utilisateur
const register = async (req, res) => {
  try {
    const { nom, email, mot_de_passe, role } = req.body;

    // Validation des champs
    if (!nom || !email || !mot_de_passe) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (nom, email, mot_de_passe)'
      });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Créer le nouvel utilisateur
    const newUser = await User.create({
      nom,
      email,
      mot_de_passe,
      role: role || 'membre'
    });

    // Générer le token JWT
    const token = generateToken(
      newUser.id_utilisateur,
      newUser.email,
      newUser.role
    );

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user: newUser.toSafeObject(),
        token
      }
    });

  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'inscription',
      error: error.message
    });
  }
};

// Connexion d'un utilisateur
const login = async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    // Validation des champs
    if (!email || !mot_de_passe) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Chercher l'utilisateur
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(mot_de_passe);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = generateToken(
      user.id_utilisateur,
      user.email,
      user.role
    );

    res.status(200).json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: user.toSafeObject(),
        token
      }
    });

  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
};

// Obtenir le profil de l'utilisateur connecté
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.status(200).json({
      success: true,
      data: user.toSafeObject()
    });

  } catch (error) {
    console.error('Erreur profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};