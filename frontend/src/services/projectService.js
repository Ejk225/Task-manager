import api from './api';

const projectService = {
  // Créer un projet
  createProject: async (data) => {
    try {
      const response = await api.post('/projects', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création du projet' };
    }
  },

  // Récupérer tous les projets
  getAllProjects: async () => {
    try {
      const response = await api.get('/projects');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des projets' };
    }
  },

  // Récupérer un projet par ID
  getProjectById: async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération du projet' };
    }
  },

  // Modifier un projet
  updateProject: async (id, data) => {
    try {
      const response = await api.put(`/projects/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la modification du projet' };
    }
  },

  // Supprimer un projet
  deleteProject: async (id) => {
    try {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression du projet' };
    }
  },

  // Ajouter un membre
  addMember: async (projectId, data) => {
    try {
      const response = await api.post(`/projects/${projectId}/members`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'ajout du membre' };
    }
  },

  // Récupérer les membres
  getMembers: async (projectId) => {
    try {
      const response = await api.get(`/projects/${projectId}/members`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des membres' };
    }
  },

  // Retirer un membre
  removeMember: async (projectId, userId) => {
    try {
      const response = await api.delete(`/projects/${projectId}/members/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du retrait du membre' };
    }
  },

  // Quitter un projet
  leaveProject: async (projectId) => {
    try {
      const response = await api.post(`/projects/${projectId}/leave`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la sortie du projet' };
    }
  }
};

export default projectService;