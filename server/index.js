require('dotenv').config({ path: '../.env' });

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const connectDB = require('./db');
const apiRoutes = require('./routes/api');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);
app.get('/api/db-status', (req, res) => {
    res.json({
        connected: global.isDbConnected,
        mode: global.isDbConnected ? 'MongoDB' : 'In-Memory Mock'
    });
});

// Socket.io Setup
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in development
        methods: ["GET", "POST"]
    }
});

// Socket Logic
const setupSocket = require('./socket');
setupSocket(io);

const PORT = process.env.PORT || 5000;

connectDB().then((isConnected) => {
    // Make DB status globally accessible for models
    global.isDbConnected = isConnected;

    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        if (!isConnected) {
            console.log("NOTE: Server is running with MOCK IN-MEMORY DATABASE.");
        }
    });
});
