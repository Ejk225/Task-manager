import api from './api';

const commentService = {
  getComments: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  addComment: async (taskId, contenu) => {
    const response = await api.post(`/tasks/${taskId}/comments`, { contenu });
    return response.data;
  },

  updateComment: async (commentId, contenu) => {
    const response = await api.put(`/comments/${commentId}`, { contenu });
    return response.data;
  },

  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  }
};

export default commentService;