import axios from 'axios';
import { Auth } from 'aws-amplify'; // updated import

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
    // Get the current session from Amplify Auth
    const session = await Auth.currentSession();
    const idToken = session.getIdToken();
    const token = idToken.getJwtToken(); // proper JWT string
    config.headers.Authorization = `Bearer ${token}`;
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

export const taskAPI = {
  // Get all tasks
  getTasks: async (status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  },

  // Create a new task
  createTask: async (taskData) => {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },

  // Update a task
  updateTask: async (taskId, updates) => {
    const response = await apiClient.put(`/tasks/${taskId}`, updates);
    return response.data;
  },

  // Assign a task
  assignTask: async (taskId, userId) => {
    const response = await apiClient.post(`/tasks/${taskId}/assign`, { userId });
    return response.data;
  },

  // Close a task
  closeTask: async (taskId) => {
    const response = await apiClient.post(`/tasks/${taskId}/close`);
    return response.data;
  },
};

export default apiClient;