const { User, Document, Department, sequelize } = require('./src/models');

async function checkData() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const userCount = await User.count();
        const docCount = await Document.count();
        const deptCount = await Department.count();

        console.log(`Users: ${userCount}`);
        console.log(`Documents: ${docCount}`);
        console.log(`Departments: ${deptCount}`);

        if (docCount > 0) {
            const docs = await Document.findAll({ limit: 5 });
            console.log('Sample documents:', JSON.stringify(docs, null, 2));
        }

        const [results, metadata] = await sequelize.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'documents'");
        console.log('Documents table columns:', results);

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkData();
