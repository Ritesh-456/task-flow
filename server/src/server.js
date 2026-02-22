const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:8080", "http://localhost:8081", "http://localhost:8082", "http://localhost:8083", "http://localhost:8084", "http://localhost:8085", process.env.CLIENT_URL],
        methods: ["GET", "POST", "PUT", "DELETE"],
    },
});

const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const auditLog = require('./middleware/auditMiddleware');

app.use(express.json());
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(cors({
    origin: ["http://localhost:8080", "http://localhost:8081", "http://localhost:8082", "http://localhost:8083", "http://localhost:8084", "http://localhost:8085", process.env.CLIENT_URL],
    credentials: true // Important for cookies
}));

// Apply Rate Limiting globally to API endpoints
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 2000, // raised severely to allow local Vite HMR spam without 429 errors
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use('/api', limiter);

// Make uploads folder static
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));

// Initialize Cron Jobs
require('./cron')();

const errorHandler = require('./middleware/errorMiddleware');
app.use(errorHandler);

// Socket.io connection
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Clients must explicitly join their authorized rooms when connecting
    socket.on('join_rooms', (data) => {
        if (data.organizationId) {
            socket.join(`org_${data.organizationId}`);
            console.log(`User ${socket.id} joined org_${data.organizationId}`);
        }
        if (data.teamId) {
            socket.join(`team_${data.teamId}`);
        }
    });

    socket.on('join_project', (projectId) => {
        socket.join(projectId);
        console.log(`User ${socket.id} joined project ${projectId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    socket.on('performance_update', ({ userId, teamId, organizationId }) => {
        // Broadcast strictly to their Team or Organization, NEVER globally
        const targetRoom = teamId ? `team_${teamId}` : (organizationId ? `org_${organizationId}` : null);
        if (targetRoom) {
            io.to(targetRoom).emit('performance_updated', userId);
        }
    });
});

// Make io accessible in routes
app.set('socketio', io);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Failed to connect to DB:', error);
        process.exit(1);
    }
};

startServer();
