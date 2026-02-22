import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for User Impersonation header
api.interceptors.request.use((config) => {
    const impersonatedId = localStorage.getItem('taskflow_impersonated_user');
    if (impersonatedId && config.headers) {
        config.headers['x-impersonate-user'] = impersonatedId;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add a response interceptor to handle 401 errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const isAuthRoute = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register');
            if (!isAuthRoute) {
                // Auto-logout if token is invalid/expired
                localStorage.removeItem('taskflow_user');
                window.location.reload(); // Reload to clear state and redirect to login
            }
        }
        return Promise.reject(error);
    }
);

export default api;
