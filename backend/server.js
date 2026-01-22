const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./config/db');
const authController = require('./controllers/authController');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

// Chat Real-time
io.on('connection', (socket) => {
    socket.on('join_room', (id) => socket.join(id));
    socket.on('send_message', (data) => io.emit('receive_message', data));
});

// Routes
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// ดึงรายการหนังสือ (Book List)
app.get('/api/books', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM books');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Stats
app.get('/api/admin/stats', async (req, res) => {
    const [users] = await pool.query('SELECT COUNT(*) as c FROM users');
    res.json({ users: users[0].c, sales: 0 }); // Mock sales ไว้ก่อน
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));