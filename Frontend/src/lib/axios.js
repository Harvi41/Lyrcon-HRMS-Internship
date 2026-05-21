import axios from 'axios';

// Get API base URL from environment variables
// Falls back to localhost:5000 if not defined
const getBaseURL = () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    
    if (!baseURL) {
        console.warn(
            '⚠️ VITE_API_BASE_URL is not defined. Falling back to http://localhost:5000'
        );
        return 'http://localhost:5000';
    }
    
    console.log(`✅ Using API Base URL: ${baseURL}`);
    return baseURL;
};

// Create a reusable Axios instance targeting your backend
const API = axios.create({
    baseURL: `${getBaseURL()}/api`,
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
export const loginUser = (credentials) => API.post('/auth/login', credentials);

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
