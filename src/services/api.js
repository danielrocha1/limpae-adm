import axios from "axios";

const API_URL = (import.meta.env.VITE_API_URL || "https://limpae-adm.onrender.com").replace(/\/$/, "");
const API_BASE_URL = API_URL.endsWith("/api") ? API_URL : `${API_URL}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("limpae_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.users)) return payload.users;
  if (Array.isArray(payload?.items)) return payload.items;
  return [];
}

export const userService = {
  getAll: async () => {
    const { data } = await api.get("/users");
    return unwrapList(data);
  },
  getById: async (id) => {
    const { data } = await api.get(`/users/${id}`);
    return data?.data || data?.user || data;
  },
  create: async (userData) => {
    const { data } = await api.post("/users", userData);
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

export default api;
