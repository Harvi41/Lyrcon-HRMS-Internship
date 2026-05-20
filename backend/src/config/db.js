const mongoose = require('mongoose');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first'); // Helps with local resolution
dns.setServers(['8.8.8.8', '8.8.4.4']); // Force Google DNS

// Database connection logic using Mongoose
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB database successfully!');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
