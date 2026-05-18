import axios from 'axios';

function normalizeApiUrl(url: string) {
  return url.replace(/\/$/, '');
}

function resolveApiBaseUrl() {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) return normalizeApiUrl(configured);

  // Mặc định dùng cùng origin /api.
  // Khi mở bằng iPhone qua http://IP_MAY_TINH:5173, API vẫn đi cùng cổng 5173.
  return '/api';
}

export const API_BASE_URL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fam_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const currentPath = window.location.pathname;

    if ((status === 401 || status === 403) && currentPath !== '/login') {
      localStorage.removeItem('fam_token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);
