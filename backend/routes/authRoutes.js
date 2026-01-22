const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes protégées (nécessite authentification)
router.get('/profile', authenticate, getProfile);

module.exports = router;