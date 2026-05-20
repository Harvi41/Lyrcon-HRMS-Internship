require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const assetRoutes = require('./src/routes/assetRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();
connectDB();

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);

app.listen(process.env.PORT || 5000, () => console.log(`Server is running on port ${process.env.PORT || 5000}`));
