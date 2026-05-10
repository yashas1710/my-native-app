import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if NOT on auth endpoints (login/signup)
      // Auth endpoints should handle their own 401 errors (invalid credentials)
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      
      if (!isAuthEndpoint) {
        // Token invalid or expired → logout and redirect
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  signup: (name, email, password, accommodationId) =>
    api.post("/auth/signup", { name, email, password, accommodationId }),
  
  login: (email, password) =>
    api.post("/auth/login", { email, password }),
  
  getMe: () => api.get("/auth/me"),
};

// Plans endpoints
export const plansAPI = {
  getFeed: (page = 1) => api.get("/plans", { params: { page } }),
  
  getPlanById: (id) => api.get(`/plans/${id}`),
  
  createPlan: (planData) => api.post("/plans", planData),
  
  updatePlan: (id, planData) => api.put(`/plans/${id}`, planData),
  
  deletePlan: (id) => api.delete(`/plans/${id}`),
  
  joinPlan: (id) => api.post(`/plans/${id}/join`),
  
  leavePlan: (id) => api.post(`/plans/${id}/leave`),
  
  getMyCreatedPlans: (page = 1) => api.get("/plans/me/created", { params: { page } }),
  
  getMyJoinedPlans: (page = 1) => api.get("/plans/me/joined", { params: { page } }),
};

export default api;

