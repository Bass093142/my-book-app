const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./config/db');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" } 
});

app.use(cors());

// ✅ ส่วนนี้ถูกต้องแล้ว: ขยายท่อรับข้อมูลเป็น 50mb เพื่อให้ส่งรูปได้
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => res.send('Backend is running!'));

// Routes
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);
app.get('/api/profile/:id', userController.getProfile);
app.put('/api/profile/update', userController.updateProfile);

app.get('/api/books', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM books');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 👇 เพิ่มส่วนนี้ครับ! ระบบแชทถึงจะทำงานได้
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (data) => {
        socket.join(data);
    });

    socket.on('send_message', (data) => {
        // ส่งข้อความกลับไปหาทุกคนในห้อง (หรือ Broadcast ก็ได้สำหรับการทดสอบ)
        io.emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));