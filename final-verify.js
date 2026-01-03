const db = require('./src/models');
const { User, Document, sequelize } = db;

async function finalVerify() {
    try {
        console.log('Testing User query...');
        const user = await User.findOne({
            attributes: ['id', 'username', 'fullName', 'createdAt'],
            limit: 1
        });
        if (user) {
            console.log('User query successful!');
            console.log('User fullName:', user.fullName);
            console.log('User createdAt:', user.createdAt);
        } else {
            console.log('No users found, but query succeeded.');
        }

        console.log('\nTesting Document query with order...');
        const doc = await Document.findOne({
            order: [['createdAt', 'DESC']]
        });
        console.log('Document query successful!');

        process.exit(0);
    } catch (error) {
        console.error('\nVERIFICATION FAILED!');
        console.error(error);
        process.exit(1);
    }
}

finalVerify();
