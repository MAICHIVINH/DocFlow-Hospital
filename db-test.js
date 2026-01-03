require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./src/config/db.config.js')['development'];
const fs = require('fs');

async function runTest() {
    const results = {
        success: false,
        error: null,
        tables: {},
        env: {
            DB_HOST: process.env.DB_HOST,
            DB_PORT: process.env.DB_PORT,
            DB_NAME: process.env.DB_NAME,
            DB_USER: process.env.DB_USER
        }
    };

    const sequelize = new Sequelize(config.database, config.username, config.password, {
        host: config.host,
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
            connectTimeout: 5000
        }
    });

    try {
        await sequelize.authenticate();
        results.success = true;

        const tables = await sequelize.getQueryInterface().showAllTables();
        for (const table of tables) {
            try {
                const columns = await sequelize.getQueryInterface().describeTable(table);
                results.tables[table] = Object.keys(columns);
            } catch (err) {
                results.tables[table] = 'Error: ' + err.message;
            }
        }
    } catch (err) {
        results.error = err.message;
    } finally {
        fs.writeFileSync('db-test-results.json', JSON.stringify(results, null, 2));
        await sequelize.close();
        process.exit(0);
    }
}

setTimeout(() => {
    fs.writeFileSync('db-test-results.json', JSON.stringify({ error: 'Timeout' }, null, 2));
    process.exit(1);
}, 10000);

runTest();
