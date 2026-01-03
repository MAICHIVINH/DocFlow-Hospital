const { AuditLog, User, Sequelize } = require('../models');
const { Op } = Sequelize;

const getAuditLogs = async (req, res) => {
    try {
        const { page = 1, limit = 20, action, user_id, start_date, end_date } = req.query;
        const offset = (page - 1) * limit;

        const whereCondition = {};
        if (action) {
            whereCondition.action = { [Op.iLike]: `%${action}%` };
        }
        if (user_id) {
            whereCondition.userId = user_id;
        }
        if (start_date && end_date) {
            whereCondition.createdAt = {
                [Op.between]: [new Date(start_date), new Date(end_date)]
            };
        } else if (start_date) {
            whereCondition.createdAt = { [Op.gte]: new Date(start_date) };
        } else if (end_date) {
            whereCondition.createdAt = { [Op.lte]: new Date(end_date) };
        }

        const { count, rows } = await AuditLog.findAndCountAll({
            where: whereCondition,
            include: [{
                model: User,
                as: 'user',
                attributes: ['fullName', 'username']
            }],
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.status(200).json({
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAuditLogs
};
