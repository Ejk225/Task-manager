require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); 
const { sequelize } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;


// Middlewares
// --- Liste des origines autorisées ---
const allowedOrigins = [
  process.env.FRONTEND_URL,       // Frontend déployé (Railway)
  'http://localhost:5173',        // Frontend en développement local (Vite)
  'http://localhost:3000'         // Au cas où tu testes aussi ce port
].filter(Boolean); // enlève les valeurs undefined/vides

app.use(cors({
  origin: function (origin, callback) {
    // Autorise aussi les requêtes sans origine (ex: Postman, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  Origine CORS refusée : ${origin}`);
      callback(new Error('Non autorisé par la politique CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Serveur Task Manager opérationnel',
    timestamp: new Date().toISOString()
  });
});

// Routes d'authentification
app.use('/api/auth', require('./routes/authRoutes'));

// Routes des projets
app.use('/api/projects', require('./routes/projectRoutes'));

// Routes des tâches
app.use('/api', require('./routes/taskRoutes'));

// Routes des commentaires
app.use('/api', require('./routes/commentRoutes'));

// Routes des statistiques
app.use('/api/stats', require('./routes/statsRoutes'));


// Servir les fichiers uploadés
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes pièces jointes
app.use('/api', require('./routes/attachmentRoutes'));

// Routes historique
app.use('/api', require('./routes/historyRoutes'));

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erreur serveur',
    message: err.message 
  });
});

// Démarrage du serveur avec test de connexion DB
const startServer = async () => {
  try {
    // Test connexion base de données
    await sequelize.authenticate();
    console.log('✅ Connexion PostgreSQL réussie');
    
    // Synchronisation des modèles (création tables si nécessaire)
    await sequelize.sync({ alter: false });
    console.log('✅ Base de données synchronisée');
    
    // Démarrage serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📊 Environnement: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Erreur de démarrage:', error);
    process.exit(1);
  }
};


startServer();