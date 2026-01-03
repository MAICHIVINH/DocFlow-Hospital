const { User, Document, sequelize } = require('./src/models');

async function testQuery() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        // Test User query
        console.log('\n--- Testing User Query ---');
        await User.findAll({
            limit: 1,
            order: [['created_at', 'DESC']],
            logging: (sql) => console.log('SQL Generated for User:', sql)
        });

        // Test Document query
        console.log('\n--- Testing Document Query ---');
        await Document.findAll({
            limit: 1,
            order: [['created_at', 'DESC']],
            logging: (sql) => console.log('SQL Generated for Document:', sql)
        });

    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await sequelize.close();
    }
}

testQuery();
