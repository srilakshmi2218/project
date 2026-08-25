import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Authorization Token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agent_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle network errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = 'Unable to connect to backend server (http://localhost:5000). Please start the backend server.';
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('agent_token', response.data.token);
      localStorage.setItem('agent_user', JSON.stringify(response.data.agent));
    }
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('agent_token', response.data.token);
      localStorage.setItem('agent_user', JSON.stringify(response.data.agent));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('agent_token');
    localStorage.removeItem('agent_user');
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem('agent_user');
    return userStr ? JSON.parse(userStr) : null;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// Customer Service
export const customerService = {
  getCustomers: async () => {
    const response = await api.get('/customers');
    return response.data;
  },
  addCustomer: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },
};

// Call Service
export const callService = {
  initiateCall: async (callData) => {
    const response = await api.post('/calls/initiate', callData);
    return response.data;
  },
  getCalls: async () => {
    const response = await api.get('/calls');
    return response.data;
  },
  updateCallStatus: async (statusData) => {
    const response = await api.post('/calls/status', statusData);
    return response.data;
  },
};

export default api;
