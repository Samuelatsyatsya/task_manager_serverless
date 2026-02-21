// api.js
import axios from 'axios';
import Auth from '@aws-amplify/auth'; // changed import

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

const apiClient = axios.create({
  baseURL: API_ENDPOINT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const session = await Auth.currentSession();
    const token = session.getIdToken().getJwtToken(); // use Amplify's session methods
    config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

export const taskAPI = {
  getTasks: async (status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  },
  createTask: async (taskData) => {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },
  updateTask: async (taskId, updates) => {
    const response = await apiClient.put(`/tasks/${taskId}`, updates);
    return response.data;
  },
  assignTask: async (taskId, userId) => {
    const response = await apiClient.post(`/tasks/${taskId}/assign`, { userId });
    return response.data;
  },
  closeTask: async (taskId) => {
    const response = await apiClient.post(`/tasks/${taskId}/close`);
    return response.data;
  },
};

export default apiClient;