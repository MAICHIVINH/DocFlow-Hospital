require('dotenv').config();
const { sequelize } = require('./src/models');

async function checkLocks() {
    try {
        console.log('Checking for active DB sessions and locks...');

        const [sessions] = await sequelize.query(`
            SELECT pid, usename, state, query, wait_event_type, wait_event
            FROM pg_stat_activity
            WHERE datname = 'hospital_docs' AND pid <> pg_backend_pid()
        `);
        console.log('Active Sessions:', sessions);

        const [locks] = await sequelize.query(`
            SELECT pid, locktype, mode, granted, relation::regclass as relname
            FROM pg_locks
            WHERE relation IS NOT NULL AND pid <> pg_backend_pid()
        `);
        console.log('Active Locks:', locks);

        process.exit(0);
    } catch (error) {
        console.error('Error checking locks:', error);
        process.exit(1);
    }
}

checkLocks();
