import axios from 'axios';
import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API methods
export const userAPI = {
  getAll: (limit = 50) => api.get(`/api/users?limit=${limit}`),
  getMe: () => api.get('/api/users/me'),
  initUser: () => api.post('/api/users/init'),
  updateMe: (data: any) => api.patch('/api/users/me', data),
  sendFriendRequest: (toUid: string) => api.post('/api/users/friends/request', { toUid }),
  acceptFriendRequest: (fromUid: string) => api.post('/api/users/friends/accept', { fromUid }),
};

export const alertAPI = {
  getAlerts: (limit = 20) => api.get(`/api/alerts?limit=${limit}`),
  createAlert: (data: {
    threatLevel: string;
    message?: string;
    sensorData?: any;
  }) => api.post('/api/alerts', data),
};

export const healthAPI = {
  check: () => api.get('/health'),
  ping: () => api.get('/api/ping'),
};

export default api;
