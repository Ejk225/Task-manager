import api from './api';

const taskService = {
  // Créer une tâche
  createTask: async (projectId, data) => {
    try {
      const response = await api.post(`/projects/${projectId}/tasks`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la création de la tâche' };
    }
  },

  // Récupérer toutes les tâches d'un projet
  getTasksByProject: async (projectId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.priorite) params.append('priorite', filters.priorite);
      if (filters.assignee) params.append('assignee', filters.assignee);
      if (filters.search) params.append('search', filters.search);

      const queryString = params.toString();
      const url = `/projects/${projectId}/tasks${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des tâches' };
    }
  },

  // Récupérer une tâche par ID
  getTaskById: async (taskId) => {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération de la tâche' };
    }
  },

  // Modifier une tâche
  updateTask: async (taskId, data) => {
    try {
      const response = await api.put(`/tasks/${taskId}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la modification de la tâche' };
    }
  },

  // Supprimer une tâche
  deleteTask: async (taskId) => {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la suppression de la tâche' };
    }
  },

  // Assigner une tâche
  assignTask: async (taskId, userId) => {
    try {
      const response = await api.put(`/tasks/${taskId}/assign`, {
        id_utilisateur_assigne: userId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de l\'assignation de la tâche' };
    }
  },

  // Changer le statut
  updateTaskStatus: async (taskId, statut) => {
    try {
      const response = await api.put(`/tasks/${taskId}/status`, { statut });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du changement de statut' };
    }
  }
};

export default taskService;