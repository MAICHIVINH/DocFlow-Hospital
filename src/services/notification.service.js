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
                console.log(`[NOTIFICATION] Found email for user ${recipientId}: ${user.email}`);
                const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
                const emailHtml = `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                        <h2 style="color: #2b6cb0;">${title}</h2>
                        <p style="font-size: 16px; color: #4a5568;">${content}</p>
                        ${link ? `<div style="margin-top: 25px;">
                            <a href="${clientUrl}${link}" style="background-color: #3182ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                                Xem chi tiết
                            </a>
                        </div>` : ''}
                        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
                        <p style="font-size: 12px; color: #a0aec0;">Đây là thông báo tự động từ hệ thống DocFlow Hospital. Vui lòng không trả lời email này.</p>
                    </div>
                `;
                const sent = await emailService.sendEmail(user.email, title, content, emailHtml);
                if (!sent) console.warn(`[NOTIFICATION] Email failed to send to ${user.email}`);
            } else {
                console.log(`[NOTIFICATION] User ${recipientId} has NO email address configured, skipping email.`);
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
