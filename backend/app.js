require('dotenv').config({ quiet: true }); 
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');
const seedRoles = require('./src/seed/rolesSeeder');
const seedHrUser = require('./src/seed/hrUserSeeder');
const authRoutes = require('./src/routes/authRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');
const assetRoutes = require('./src/routes/assetRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');

const app = express();

const allowedOrigins = [
	process.env.CLIENT_URL,
	process.env.FRONTEND_URL,
	'https://lyrcon-hrms-internship.vercel.app',
].filter(Boolean);

const startServer = async () => {
	await connectDB();
	await seedRoles();
	await seedHrUser();

	const PORT = process.env.PORT || 5000;
	app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
};

startServer().catch((error) => {
	console.error('Bootstrap seeding error:', error.message);
	process.exit(1);
});

// Security and Parsers Middleware
app.disable('x-powered-by');
app.use(cors({
	origin: (origin, callback) => {
		if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
			return callback(null, true);
		}

		return callback(new Error(`CORS blocked for origin: ${origin}`));
	},
	credentials: true,
}));
app.use(express.json());

// Main Routing Layers
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/assets', assetRoutes);
