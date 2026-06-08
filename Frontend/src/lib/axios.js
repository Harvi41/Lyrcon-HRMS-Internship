import axios from 'axios';

// Get API base URL from environment variables
let BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

if (!BASE_URL.endsWith('/api') && !BASE_URL.endsWith('/api/')) {
    BASE_URL = `${BASE_URL.replace(/\/+$/, '')}/api`;
}

// Create a reusable Axios instance targeting your backend
const API = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, 
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
export const googleLogin = (tokenId) => API.post('/auth/google-login', { tokenId });
export const forgotPassword = (email) => API.post('/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => API.post('/auth/reset-password', { token, newPassword });
export const changePassword = (payload) => API.put('/auth/change-password', payload);
export const createDashboardUser = (payload) => API.post('/auth/register-user', payload);

// ==========================================
// 👥 EMPLOYEE ENDPOINTS
// ==========================================
export const getAllEmployees = () => API.get('/employees');
export const getMe = () => API.get('/employees/me');
export const getDirectory = () => API.get('/employees/directory');
export const createEmployee = (employeeData) => API.post('/employees', employeeData);
export const updateEmployee = (id, updatedData) => API.put(`/employees/${id}`, updatedData);
export const deleteEmployee = (id) => API.delete(`/employees/${id}`);

// ==========================================
// 🔐 ROLE MANAGEMENT ENDPOINTS
// ==========================================
export const getRoles = () => API.get('/roles');
export const updateRolePermissions = (payload) => API.post('/roles/update', payload);

// ==========================================
// 💻 ASSET MANAGEMENT ENDPOINTS
// ==========================================
export const getAllAssets = () => API.get('/assets');
export const getMyAssets = () => API.get('/assets/my-assets');
export const getAssetSummary = () => API.get('/assets/summary');
export const createAsset = (assetData) => API.post('/assets', assetData);
export const addAssetComment = (id, commentText) => API.post(`/assets/${id}/comment`, { comment: commentText });
export const markAssetDamaged = (id, userId) => API.put(`/assets/${id}/damage`, { damagedBy: userId });

// ==========================================
// 📍 ATTENDANCE ENDPOINTS
// ==========================================
export const clockIn = (deviceFingerprint) => API.post('/attendance/clock-in', { deviceFingerprint });
export const getMyAttendanceLogs = () => API.get('/attendance/my-logs');
export const clockOut = () => API.post('/attendance/clock-out');
export const getLiveRoster = () => API.get('/attendance/live-roster');
export const getEmployeeAttendance = (employeeId, month) => {
    const url = month ? `/attendance/employee/${employeeId}?month=${month}` : `/attendance/employee/${employeeId}`;
    return API.get(url);
};

// ==========================================
// 🏖️ LEAVE MANAGEMENT ENDPOINTS
// ==========================================
export const getAllLeaves = () => API.get('/leaves');
export const getMyLeaves = () => API.get('/leaves/my-requests');
export const applyLeave = (leaveData) => API.post('/leaves/apply', leaveData);
export const processLeave = (id, payload) => API.put(`/leaves/${id}/review`, payload);

// ==========================================
// 💳 PAYROLL ENDPOINTS
// ==========================================
export const getPayrollHistory = (employeeId) => API.get(`/payroll/history/${employeeId}`);
export const processMonthlyPayroll = (payload) => API.post('/payroll/calculate', payload);
export const downloadPayslipPDF = (payrollId) => API.get(`/payroll/download/${payrollId}`, { responseType: 'blob' });
export const getMyPayroll = () => API.get('/payroll/self-history');
export const getMonthlyPayrollDashboard = (month) => API.get(`/payroll/dashboard?month=${month}`);
export const getYearlyPayrollDashboard = (year) => API.get(`/payroll/yearly?year=${year}`);

// ==========================================
// 📝 TASK MANAGEMENT ENDPOINTS
// ==========================================
export const getAllTasks = () => API.get('/tasks');
export const getTasks = () => API.get('/tasks');
export const createTask = (taskData) => API.post('/tasks', taskData);
export const updateTask = (id, updatedData) => API.put(`/tasks/${id}`, updatedData);
export const updateTaskStatus = (id, statusData) => API.put(`/tasks/${id}/status`, statusData);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// ==========================================
// 📣 ANNOUNCEMENT & NOTIFICATION ENDPOINTS
// ==========================================
export const getAnnouncements = () => API.get('/announcements');
export const publishAnnouncement = (payload) => API.post('/announcements', payload);
export const markAnnouncementAsRead = (id) => API.post(`/announcements/${id}/read`);
export const getTargetOptions = () => API.get('/announcements/targets');

// ==========================================
// 📊 DASHBOARD METRICS ENDPOINTS
// ==========================================
export const getEmployeeSummary = () => API.get('/dashboard/employee/summary');

// ==========================================
// 👁️ BIOMETRIC FACE RECOGNITION ENDPOINTS 
// ==========================================
export const registerFaceMetrics = (embedding, deviceId) => API.post('/biometrics/register-face', { embedding, deviceId });
export const verifyFaceAndLogin = (email, embedding, deviceId) => API.post('/biometrics/verify-face', { email, embedding, deviceId });

export default API;
