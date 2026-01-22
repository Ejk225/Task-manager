import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      const token = localStorage.getItem('token');
      
      if (currentUser && token) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  // Fonction de connexion
  const login = async (email, mot_de_passe) => {
    try {
      const response = await authService.login(email, mot_de_passe);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Fonction d'inscription
  const register = async (nom, email, mot_de_passe) => {
    try {
      const response = await authService.register(nom, email, mot_de_passe);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};