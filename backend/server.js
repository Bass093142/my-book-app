const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./config/db');
require('dotenv').config();

// Import Controllers
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const adminController = require('./controllers/adminController');

const app = express();
const server = http.createServer(app);

// ตั้งค่า Socket.io
const io = new Server(server, { 
    cors: { origin: "*" } 
});

app.use(cors());

// ตั้งค่ารับไฟล์ขนาดใหญ่
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => res.send('Backend is running! 🚀'));

// ==========================
// 🔗 API Routes
// ==========================

// 1. Auth & Users
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);
app.get('/api/profile/:id', userController.getProfile);
app.put('/api/profile/update', userController.updateProfile);

// 2. Admin & Books
app.get('/api/admin/stats', adminController.getStats);
app.get('/api/admin/users', adminController.getAllUsers);
app.post('/api/admin/ban', adminController.banUser);
app.get('/api/books', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM books ORDER BY id DESC');
        res.json(rows);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});
app.post('/api/books', adminController.addBook);
app.delete('/api/books/:id', adminController.deleteBook);

// 3. ✅ API Chat (เพิ่มใหม่: ดึงประวัติการคุย)
app.get('/api/chat/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        // ดึงข้อความทั้งหมดที่ User นี้เกี่ยวข้อง (ส่งเอง หรือ รับ)
        const [rows] = await pool.query(
            `SELECT * FROM chat_messages 
             WHERE sender_id = ? OR receiver_id = ? 
             ORDER BY created_at ASC`, 
            [userId, userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================
// 💬 Socket.io (Chat System + DB Save)
// ==========================
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // เข้าห้องส่วนตัว
    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
    });

    // รับ-ส่งข้อความ
    socket.on('send_message', async (data) => {
        // data = { sender_id, receiver_id, message }
        console.log("Msg received:", data);

        // 1. ส่งหาคนรับ (Real-time)
        io.to(data.receiver_id).emit('receive_message', data);
        
        // 2. ส่งกลับหาตัวเอง (เพื่อให้หน้าจออัปเดตทันที ไม่ต้องรอ API)
        socket.emit('receive_message', data);

        // 3. ถ้าส่งหาแอดมิน ให้แจ้งเตือนห้อง admin (ถ้าคุณทำห้องแยก)
        if(data.receiver_id === 'admin') {
             io.emit('receive_message_admin', data); 
        }

        // 4. ✅ บันทึกลง Database (สำคัญ!)
        try {
            await pool.query(
                'INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)',
                [data.sender_id, data.receiver_id, data.message]
            );
        } catch (err) {
            console.error("Save chat error:", err);
        }
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));