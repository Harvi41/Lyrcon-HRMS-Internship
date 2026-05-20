require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');


const authRoutes = require('./src/routes/authRoutes');
const employeeRoutes = require('./src/routes/employeeRoutes');

const app = express();


connectDB();


app.use(express.json());
app.use(cors());


app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
