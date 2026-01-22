const jwt = require('jsonwebtoken');

// Générer un token JWT
const generateToken = (userId, email, role) => {
  const payload = {
    id: userId,
    email: email,
    role: role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Vérifier un token JWT
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
};

// Décoder un token sans vérification (pour debug)
const decodeToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateToken,
  verifyToken,
  decodeToken
};