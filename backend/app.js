require('dotenv').config({ quiet: true }); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const authRoutes = require('./src/routes/authRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const assetRoutes = require('./src/routes/assetRoutes');

const app = express();

connectDB();

// Security and Parsers Middleware
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());

// Main Routing Layers
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);

// Server Instantiation
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));