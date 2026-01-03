require('dotenv').config();
console.log('ENV TEST START');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('SMTP_HOST:', process.env.SMTP_HOST || 'not set');
console.log('ENV TEST END');
