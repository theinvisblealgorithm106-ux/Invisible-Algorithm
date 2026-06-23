import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_URL = typeof window !== 'undefined'
  ? '/api'
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
          // session expired
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
          // session expired
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; firstName: string; lastName: string; school?: string; country?: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
};

export const usersApi = {
  getMembers: (params?: Record<string, unknown>) => api.get('/users/members', { params }),
  getUserById: (id: string) => api.get(`/users/${id}`),
  updateProfile: (data: Record<string, unknown>) => api.patch('/users/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.patch('/users/change-password', data),
  getAllUsers: (params?: Record<string, unknown>) => api.get('/users', { params }),
  updateUserRole: (id: string, role: string) => api.patch(`/users/${id}/role`, { role }),
  toggleUserStatus: (id: string) => api.patch(`/users/${id}/toggle-status`),
  getStats: () => api.get('/users/stats/overview'),
};

export const researchApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/research', { params }),
  getById: (id: string) => api.get(`/research/${id}`),
  create: (data: Record<string, unknown>) => api.post('/research', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/research/${id}`, data),
  delete: (id: string) => api.delete(`/research/${id}`),
  getStats: () => api.get('/research/stats'),
};

export const eventsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/events', { params }),
  getById: (id: string) => api.get(`/events/${id}`),
  create: (data: Record<string, unknown>) => api.post('/events', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  register: (id: string, data: { name: string; email: string }) => api.post(`/events/${id}/register`, data),
  getStats: () => api.get('/events/stats'),
};

export const applicationsApi = {
  submit: (data: Record<string, unknown>) => api.post('/applications', data),
  getAll: (params?: Record<string, unknown>) => api.get('/applications', { params }),
  getById: (id: string) => api.get(`/applications/${id}`),
  review: (id: string, data: { status: string; reviewNotes?: string }) => api.patch(`/applications/${id}/review`, data),
  getStats: () => api.get('/applications/stats'),
};

export const announcementsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/announcements', { params }),
  getById: (id: string) => api.get(`/announcements/${id}`),
  create: (data: Record<string, unknown>) => api.post('/announcements', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/announcements/${id}`, data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
};

export const contactApi = {
  submit: (data: Record<string, unknown>) => api.post('/contact', data),
  subscribeNewsletter: (data: { email: string; firstName?: string }) => api.post('/contact/newsletter/subscribe', data),
  unsubscribeNewsletter: (email: string) => api.post('/contact/newsletter/unsubscribe', { email }),
  getMessages: (params?: Record<string, unknown>) => api.get('/contact/messages', { params }),
  updateMessageStatus: (id: string, status: string) => api.patch(`/contact/messages/${id}/status`, { status }),
  getSubscribers: () => api.get('/contact/newsletter/subscribers'),
};

export const partnershipsApi = {
  getAll: (params?: Record<string, unknown>) => api.get('/partnerships', { params }),
  getAllAdmin: (params?: Record<string, unknown>) => api.get('/partnerships/all', { params }),
  create: (data: Record<string, unknown>) => api.post('/partnerships', data),
  update: (id: string, data: Record<string, unknown>) => api.patch(`/partnerships/${id}`, data),
  delete: (id: string) => api.delete(`/partnerships/${id}`),
};

export default api;
