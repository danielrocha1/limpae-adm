import axios from 'axios';

const api = axios.create({
  baseURL: 'https://limpae-adm.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para simular/injetar auth se necessário
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const userService = {
  getAll: async () => {
    const { data } = await api.get('/users');
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data;
  },
  create: async (userData) => {
    const { data } = await api.post('/users', userData);
    return data;
  },
  update: async (id, userData) => {
    const { data } = await api.put(`/users/${id}`, userData);
    return data;
  },
  delete: async (id) => {
    await api.delete(`/users/${id}`);
  },
};

export const serviceService = {
  getAll: async () => {
    const { data } = await api.get('/services');
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/services/${id}`);
    return data;
  },
};

export default api;
