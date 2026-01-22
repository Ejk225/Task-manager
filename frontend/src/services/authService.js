import api from './api';

const authService = {
  // Inscription
  register: async (nom, email, mot_de_passe) => {
    try {
      const response = await api.post('/auth/register', {
        nom,
        email,
        mot_de_passe
      });
      
      if (response.data.success) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'inscription' };
    }
  },

  // Connexion
  login: async (email, mot_de_passe) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        mot_de_passe
      });
      
      if (response.data.success) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la connexion' };
    }
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Obtenir l'utilisateur courant
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Obtenir le profil
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du profil' };
    }
  }
};

export default authService;