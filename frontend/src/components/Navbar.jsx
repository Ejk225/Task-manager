import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/projects')}>
          <h1>📋 Task Manager</h1>
        </div>

        <div className="navbar-menu">
          <button className="nav-link" onClick={() => navigate('/projects')}>
            Projets
          </button>
          <button className="nav-link" onClick={() => navigate('/dashboard')}>
            Dashboard
          </button>
        </div>

        <div className="navbar-user">
          <span className="user-name">👤 {user?.nom}</span>
          <button onClick={handleLogout} className="btn-logout-nav">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;