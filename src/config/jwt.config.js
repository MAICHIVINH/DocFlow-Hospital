require('dotenv').config();

module.exports = {
    secret: process.env.JWT_SECRET || 'hospital-docflow-secret-key-2024',
    expiresIn: '24h', // Token valid for 24 hours
};
