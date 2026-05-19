import api from './api';

const attachmentService = {
  getAttachments: async (taskId) => {
    const response = await api.get(`/tasks/${taskId}/attachments`);
    return response.data;
  },

  uploadAttachments: async (taskId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  deleteAttachment: async (attachmentId) => {
    const response = await api.delete(`/attachments/${attachmentId}`);
    return response.data;
  },

  getDownloadUrl: (attachmentId) => {
    const token = localStorage.getItem('token');
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/attachments/${attachmentId}/download?token=${token}`;
  }
};

export default attachmentService;