import axios from 'axios';

// Get API base URL from environment variables
// Falls back to localhost:5000 if not defined during local development
let BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Self-healing check: if production URL is passed without the /api suffix, append it automatically
if (!BASE_URL.endsWith('/api') && !BASE_URL.endsWith('/api/')) {
    BASE_URL = `${BASE_URL.replace(/\/+$/, '')}/api`;
}

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
export const loginUser = (credentials) => API.post('/auth/login', credentials);
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => API.post('/auth/reset-password', { token, newPassword });

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

// ==========================================
// 🏖️ LEAVE MANAGEMENT ENDPOINTS
// ==========================================
export const getAllLeaves = () => API.get('/leaves');
export const applyLeave = (leaveData) => API.post('/leaves/apply', leaveData);
export const processLeave = (id, status) => API.put(`/leaves/process/${id}`, { status });

// ==========================================
// 💰 PAYROLL MANAGEMENT ENDPOINTS
// ==========================================

// 👔 Administrative HR/Admin Operations
export const calculateMonthlyPayroll = (employeeId, payrollMonth) => 
    API.post('/payroll/calculate', { employeeId, payrollMonth });

export const getMonthlyPayrollDashboard = (month) => 
    API.get(`/payroll/dashboard?month=${month}`);

export const updatePayrollStatus = (id, status, remarks) => 
    API.put(`/payroll/status/${id}`, { status, remarks });

export const executePaymentDisbursement = (id, disbursementDetails) => 
    API.put(`/payroll/disburse/${id}`, disbursementDetails);

// 👥 Employee Self-Service Operations
export const getSelfPayrollHistory = () => 
    API.get('/payroll/self-history');

// 🖨️ Payslip PDF Binary Stream Download
export const downloadPayslipFile = async (id, filename = 'payslip.pdf') => {
    try {
        const response = await API.get(`/payroll/download/${id}`, {
            responseType: 'blob', // 💎 CRITICAL: Tells Axios to handle binary data instead of passing a string parsing array
        });

        // Create a local virtual browser download link anchor element
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        
        document.body.appendChild(link);
        link.click();
        
        // Cleanup virtual browser memory allocations immediately after click triggers
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return true;
    } catch (error) {
        console.error("Frontend PDF download stream execution failed:", error);
        throw error;
    }
};

export default API;