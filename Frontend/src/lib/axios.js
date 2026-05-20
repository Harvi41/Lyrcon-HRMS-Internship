import axios from 'axios';

// Create a reusable Axios instance targeting your backend port
const API = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Automatically injects the JWT token from localStorage before any request flies out
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); 
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// ==========================================
// 👥 EMPLOYEE ENDPOINTS
// ==========================================
export const getAllEmployees = () => API.get('/employees');
export const createEmployee = (employeeData) => API.post('/employees', employeeData);
export const updateEmployee = (id, updatedData) => API.put(`/employees/${id}`, updatedData);

// ==========================================
// 💻 ASSET MANAGEMENT ENDPOINTS
// ==========================================
export const getAllAssets = () => API.get('/assets');
export const getAssetSummary = () => API.get('/assets/summary');
export const createAsset = (assetData) => API.post('/assets', assetData);
export const addAssetComment = (id, commentText) => API.post(`/assets/${id}/comment`, { comment: commentText });
export const markAssetDamaged = (id, userId) => API.put(`/assets/${id}/damage`, { damagedBy: userId });

export default API;