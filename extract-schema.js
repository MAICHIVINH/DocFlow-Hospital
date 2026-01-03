require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./src/config/db.config.js')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false
});

async function extractSchema() {
    try {
        await sequelize.authenticate();
        console.log('DB Connection OK');

        const tables = await sequelize.getQueryInterface().showAllTables();
        const schema = {};

        for (const table of tables) {
            const columns = await sequelize.getQueryInterface().describeTable(table);
            schema[table] = Object.keys(columns);
        }

        const fs = require('fs');
        fs.writeFileSync('db-schema.json', JSON.stringify(schema, null, 2));
        console.log('Schema extracted to db-schema.json');
        process.exit(0);
    } catch (err) {
        console.error('Schema Extraction Failed:', err);
        process.exit(1);
    }
}

extractSchema();
