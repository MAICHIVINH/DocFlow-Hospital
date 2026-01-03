let io;

const init = (server) => {
    const { Server } = require('socket.io');
    io = new Server(server, {
        cors: {
            origin: "*", // Adjust as needed for security
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`[SOCKET] User connected: ${socket.id}`);

        socket.on('join', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`[SOCKET] User ${userId} joined room: user_${userId}`);
        });

        socket.on('join_dept', (deptId) => {
            socket.join(`dept_${deptId}`);
            console.log(`[SOCKET] Socket ${socket.id} joined department room: dept_${deptId}`);
        });

        socket.on('disconnect', () => {
            console.log(`[SOCKET] User disconnected: ${socket.id}`);
        });
    });

    return io;
};

const sendToUser = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
        console.log(`[SOCKET] Sent ${event} to user_${userId}`);
    }
};

const sendToDept = (deptId, event, data) => {
    if (io) {
        io.to(`dept_${deptId}`).emit(event, data);
        console.log(`[SOCKET] Sent ${event} to dept_${deptId}`);
    }
};

const broadcast = (event, data) => {
    if (io) {
        io.emit(event, data);
        console.log(`[SOCKET] Broadcasted ${event}`);
    }
};

module.exports = {
    init,
    sendToUser,
    sendToDept,
    broadcast
};
