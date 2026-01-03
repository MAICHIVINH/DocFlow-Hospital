const db = require('../models');
const Notification = db.Notification;
const User = db.User;
const socketService = require('./socket.service');
const emailService = require('./email.service');

/**
 * Notification Service
 * Handles creation and delivery of system notifications to users
 */
const createNotification = async (recipientId, title, content, link = '', send_email = false) => {
    try {
        const notification = await Notification.create({
            recipientId: recipientId,
            title: title,
            content: content,
            link: link
        });

        console.log(`[NOTIFICATION] DB Saved for User ${recipientId}: ${title}`);

        // Real-time Emit
        socketService.sendToUser(recipientId, 'new_notification', {
            id: notification.id,
            title,
            content,
            link,
            created_at: notification.createdAt
        });

        // Optional Email
        if (send_email) {
            const user = await User.findByPk(recipientId);
            if (user && user.email) {
                await emailService.sendEmail(
                    user.email,
                    title,
                    content,
                    `<p>${content}</p><p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}${link}">Xem chi tiết</a></p>`
                );
            }
        }

        return notification;
    } catch (error) {
        console.error('Notification Error:', error);
    }
};

/**
 * Notify departmental managers
 */
const notifyManagers = async (departmentId, title, content, link) => {
    try {
        // Find all managers in this department
        const managers = await User.findAll({
            where: {
                departmentId: departmentId,
                status: 'ACTIVE'
            },
            include: [{
                model: db.Role,
                as: 'role',
                where: { name: 'MANAGER' }
            }]
        });

        const notifications = managers.map(manager => ({
            recipientId: manager.id,
            title,
            content,
            link
        }));

        if (notifications.length > 0) {
            await Notification.bulkCreate(notifications);
            console.log(`[NOTIFICATION] Bulk notified ${notifications.length} managers of dept ${departmentId}`);

            // Real-time Emit to department room
            socketService.sendToDept(departmentId, 'new_notification', {
                title,
                content,
                link
            });

            // Send Emails to managers
            for (const manager of managers) {
                if (manager.email) {
                    await emailService.sendEmail(
                        manager.email,
                        title,
                        content,
                        `<p>${content}</p><p><a href="${process.env.CLIENT_URL || 'http://localhost:3000'}${link}">Xem chi tiết</a></p>`
                    );
                }
            }
        }
    } catch (error) {
        console.error('Bulk Notification Error:', error);
    }
};

module.exports = {
    createNotification,
    notifyManagers
};
