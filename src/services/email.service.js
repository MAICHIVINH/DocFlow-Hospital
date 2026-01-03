const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            text,
            html
        });
        console.log(`[EMAIL] Message sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[EMAIL] error:', error);
        // Don't throw, just log to prevent blocking the main process
    }
};

module.exports = {
    sendEmail
};
