const db = require('./src/models');
const { User, Document, Notification, sequelize } = db;

async function verify() {
    try {
        console.log('--- Verifying Database Queries ---');

        const userCount = await User.count();
        console.log(`Users count: ${userCount}`);

        const docCount = await Document.count();
        console.log(`Documents count: ${docCount}`);

        const notifCount = await Notification.count();
        console.log(`Notifications count: ${notifCount}`);

        const recentDocs = await Document.findAll({
            limit: 5,
            order: [['created_at', 'DESC']]
        });
        console.log('Successfully fetched recent documents.');

        console.log('--- Verification Complete: SUCCESS ---');
        process.exit(0);
    } catch (error) {
        console.error('--- Verification Failed ---');
        console.error(error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

verify();
