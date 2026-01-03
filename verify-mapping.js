const db = require('./src/models');
const { Document, User, Department, Tag, sequelize } = db;
const { Op } = require('sequelize');

async function verifyFix() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        console.log('\n--- Simulating listDocuments query ---');
        const { count, rows } = await Document.findAndCountAll({
            where: { is_archived: { [Op.or]: [false, null] } },
            include: [
                { model: User, as: 'creator', attributes: ['full_name'] },
                { model: Department, as: 'department', attributes: ['name'] },
                { model: Tag, as: 'tags', through: { attributes: [] } }
            ],
            limit: 5,
            offset: 0,
            order: [['createdAt', 'DESC']],
            distinct: true
        });

        console.log('Query successful!');
        console.log('Count:', count);
        console.log('Sample Row createdAt:', rows[0] ? rows[0].createdAt : 'No data');

        process.exit(0);
    } catch (error) {
        console.error('VERIFICATION FAILED:', error);
        process.exit(1);
    }
}

verifyFix();
