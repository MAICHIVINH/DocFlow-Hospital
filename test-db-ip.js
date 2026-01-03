const { Client } = require('pg');
require('dotenv').config();

async function testConnection() {
    const client = new Client({
        host: '127.0.0.1', // Use IP instead of localhost
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '123456',
        database: process.env.DB_NAME || 'hospital_docs',
        connectionTimeoutMillis: 5000,
    });

    try {
        console.log('Connecting to 127.0.0.1...');
        await client.connect();
        console.log('Connected!');

        const res = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', res.rows.map(r => r.table_name));

        const colRes = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
        console.log('Users columns:', colRes.rows.map(r => r.column_name));

    } catch (err) {
        console.error('Connection failed:', err.message);
    } finally {
        await client.end();
    }
}

testConnection();
