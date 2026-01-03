require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('Testing SMTP connection...');
console.log('Target:', process.env.SMTP_HOST + ':' + process.env.SMTP_PORT);

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    },
    tls: {
        // Do not fail on invalid certs
        rejectUnauthorized: false
    },
    logger: true,
    debug: true
});

async function main() {
    try {
        console.log('Attempting to verify connection...');
        const verified = await transporter.verify();
        console.log('Verification result:', verified);

        console.log('Attempting to send mail...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER,
            subject: 'DocFlow SMTP Test',
            text: 'Test message verify'
        });
        console.log('Success! MessageId:', info.messageId);
        process.exit(0);
    } catch (err) {
        console.error('SMTP Error Stack:', err.stack);
        console.error('Error Code:', err.code);
        console.error('Error Command:', err.command);
        process.exit(1);
    }
}

main();
