const { verifyToken } = require('../utils/jwtUtils');
const User = require('../models/User');

// Middleware pour vérifier l'authentification
const authenticate = async (req, res, next) => {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant. Authentification requise.'
      });
    }

    // Extraire le token
    const token = authHeader.split(' ')[1];

    // Vérifier et décoder le token
    const decoded = verifyToken(token);

    // Vérifier si l'utilisateur existe toujours
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Attacher les infos utilisateur à la requête
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role
    };

    next();

  } catch (error) {
    console.error('Erreur authentification:', error);
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré',
      error: error.message
    });
  }
};

// Middleware pour vérifier les rôles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Permissions insuffisantes.'
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize
};