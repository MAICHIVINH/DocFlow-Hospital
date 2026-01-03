const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_PORT == 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        // Do not fail on invalid certs, helpful for some SMTP servers
        rejectUnauthorized: false
    }
});

const sendEmail = async (to, subject, text, html) => {
    console.log(`[EMAIL] Attempting to send email to: ${to}`);
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to,
            subject,
            text,
            html
        });
        console.log(`[EMAIL] Success! Message sent: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('[EMAIL] CRITICAL ERROR:', error.message);
        if (error.code === 'EAUTH') {
            console.error('[EMAIL] Authentication failed. Please check your SMTP_PASS (App Password).');
        }
        // Log the full error to help debugging
        console.error(error);
        return null;
    }
};

module.exports = {
    sendEmail
};
