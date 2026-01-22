import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    mot_de_passe: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.mot_de_passe);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Connexion</h1>
        <p className="auth-subtitle">Bienvenue sur Task Manager</p>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="votre.email@exemple.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="mot_de_passe">Mot de passe</label>
            <input
              type="password"
              id="mot_de_passe"
              name="mot_de_passe"
              value={formData.mot_de_passe}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-footer">
          Pas encore de compte ? 
          <Link to="/register"> S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;