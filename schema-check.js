require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./src/config/db.config.js')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function checkSchema() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        const [results] = await sequelize.query(`
            SELECT table_name, column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name IN ('notifications', 'users', 'documents')
            ORDER BY table_name, column_name;
        `);

        console.log('Schema Info:');
        console.table(results);

        const [docCount] = await sequelize.query('SELECT count(*) FROM documents');
        console.log('Document Count:', docCount[0].count);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkSchema();
