import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Task Manager</h1>
        <div className="user-info">
          <span>Bonjour, {user?.nom}</span>
          <button onClick={handleLogout} className="btn-logout">
            Déconnexion
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="welcome-card">
          <h2>Bienvenue sur votre Dashboard ! 🎉</h2>
          <p>Authentification réussie ✅</p>
          
          <div className="user-details">
            <h3>Vos informations :</h3>
            <p><strong>Nom :</strong> {user?.nom}</p>
            <p><strong>Email :</strong> {user?.email}</p>
            <p><strong>Rôle :</strong> {user?.role}</p>
            <p><strong>ID :</strong> {user?.id_utilisateur}</p>
          </div>

          <div className="next-steps">
            <h3>Prochaines étapes :</h3>
            <ul>
              <li>✅ Authentification fonctionnelle</li>
              <li>⏳ Gestion des projets (Sprint 2)</li>
              <li>⏳ Gestion des tâches (Sprint 3)</li>
              <li>⏳ Notifications temps réel (Sprint 4)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;