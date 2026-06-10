import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <>
      <Navbar />
      <div className="dashboard-main">
        <div className="welcome-card">

          <div className="welcome-header">
            <div>
              <h2>Bienvenue, {user?.nom} ! 👋</h2>
              <p className="welcome-date">{today}</p>
            </div>
          </div>

          <p className="welcome-citation">
            « Un projet bien organisé, c'est la moitié du travail accompli. »
          </p>

          <div className="welcome-actions">
            <button
              className="btn-go-projects"
              onClick={() => navigate('/projects')}
            >
              📁 Accéder à mes projets
            </button>
            <button
              className="btn-new-project"
              onClick={() => navigate('/projects/new')}
            >
              ➕ Créer un projet
            </button>
          </div>

          <div className="user-details">
            <h3>Vos informations :</h3>
            <p><strong>Nom :</strong> {user?.nom}</p>
            <p><strong>Email :</strong> {user?.email}</p>
            <p><strong>Rôle :</strong> {user?.role}</p>
          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;