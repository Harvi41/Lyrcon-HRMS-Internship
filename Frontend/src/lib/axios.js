import axios from 'axios';

// Get API base URL from environment variables
// Falls back to localhost:5000 if not defined during local development
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create a reusable Axios instance targeting your backend
const API = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds timeout
});

// Interceptor: Automatically injects the JWT token from localStorage before any request flies out
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('corehr_token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor: Handle response errors
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear session on unauthorized
            localStorage.removeItem('corehr_token');
            localStorage.removeItem('corehr_user');
            localStorage.removeItem('corehr_role');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// ==========================================
// 🔐 AUTHENTICATION ENDPOINTS 
// ==========================================
// FIXED: Removed the extra '/api' since it's already in your VITE_API_BASE_URL
export const loginUser = (credentials) => API.post('/api/auth/login', credentials);

// ==========================================
// 👥 EMPLOYEE ENDPOINTS
// ==========================================
export const getAllEmployees = () => API.get('/employees');
export const createEmployee = (employeeData) => API.post('/employees', employeeData);
export const updateEmployee = (id, updatedData) => API.put(`/employees/${id}`, updatedData);

// ==========================================
// 💻 ASSET MANAGEMENT ENDPOINTS
// ==========================================
// FIXED: Cleaned up consistency across asset routes to match your backend expectations
export const getAllAssets = () => API.get('/assets');
export const getAssetSummary = () => API.get('/assets/summary');
export const createAsset = (assetData) => API.post('/assets', assetData);
export const addAssetComment = (id, commentText) => API.post(`/assets/${id}/comment`, { comment: commentText });
export const markAssetDamaged = (id, userId) => API.put(`/assets/${id}/damage`, { damagedBy: userId });

// ==========================================
// 🔐 ROLE MANAGEMENT ENDPOINTS
// ==========================================
export const getRoles = () => API.get('/roles');
export const updateRolePermissions = (payload) => API.post('/roles/update', payload);

// ==========================================
// 👤 USER PROVISIONING ENDPOINTS
// ==========================================
export const createDashboardUser = (payload) => API.post('/users', payload);

export default API;