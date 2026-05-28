require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// 🗂️ Import Routing Layers
const authRoutes = require('./src/routes/authRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const assetRoutes = require('./src/routes/assetRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const announcementRoutes = require('./src/routes/announcementRoutes');
const leaveRoutes = require('./src/routes/leaveRoutes');
const payrollRoutes = require('./src/routes/payrollRoutes');
const taskRoutes = require('./src/routes/taskRoutes');
const attendanceRoutes = require('./src/routes/attendanceRoutes');
const app = express();

// 🌐 CORS Security Whitelist Mapping
const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  'https://lyrcon-hrms-internship.vercel.app',
  'https://lyrcon-hrms-internship.onrender.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (allowedOrigins.includes(origin)) {
    return true;
  }
  try {
    const url = new URL(origin);
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
};

// 🛡️ Execute Global Security & Body Parsers First!
app.disable('x-powered-by');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.length === 0 || isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json());

// 🚪 Mount Protected Core Business Routing Surfaces
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/attendance', attendanceRoutes);

// ⚙️ Server Initialization Loop 
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
};

startServer().catch((error) => {
  console.error('Bootstrap routing initialization error:', error.message);
  process.exit(1);
});
