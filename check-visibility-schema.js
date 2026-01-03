require('dotenv').config();
const { sequelize } = require('./src/models');

async function checkSchema() {
    try {
        const [results] = await sequelize.query(`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'documents' AND column_name = 'visibility'
        `);
        console.log('Visibility Column Schema:', results);

        const [enums] = await sequelize.query(`
            SELECT enumlabel 
            FROM pg_enum 
            JOIN pg_type ON pg_enum.enumtypid = pg_type.oid 
            WHERE pg_type.typname = 'enum_documents_visibility'
        `);
        console.log('Visibility ENUM Values:', enums.map(e => e.enumlabel));

        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
