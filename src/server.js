require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');
const authRoutes = require('./routes/auth.routes');
const docRoutes = require('./routes/document.routes');
const notifRoutes = require('./routes/notification.routes');
const statsRoutes = require('./routes/stats.routes');
const deptRoutes = require('./routes/department.routes');
const auditRoutes = require('./routes/audit.routes');
const userRoutes = require('./routes/user.routes');
const proxyRoutes = require('./routes/proxy.routes');
const tagRoutes = require('./routes/tag.routes');

const app = express();
const http = require('http');
const server = http.createServer(app);
const socketService = require('./services/socket.service');

// Initialize Socket.io
socketService.init(server);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', docRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/departments', deptRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tags', tagRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to DocFlow Hospital API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: err.message || 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
db.sequelize.sync({ alter: true }).then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}.`);
    });
}).catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
});
