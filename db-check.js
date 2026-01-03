require('dotenv').config();
const { Sequelize } = require('sequelize');
const config = require('./src/config/db.config.js')['development'];

const sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    dialectOptions: {
        connectTimeout: 5000
    },
    logging: console.log
});

async function checkDB() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const [users] = await sequelize.query('SELECT count(*) FROM users');
        const [depts] = await sequelize.query('SELECT count(*) FROM departments');
        const [roles] = await sequelize.query('SELECT count(*) FROM roles');

        console.log('Users count:', users[0].count);
        console.log('Departments count:', depts[0].count);
        console.log('Roles count:', roles[0].count);

        process.exit(0);
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

checkDB();
