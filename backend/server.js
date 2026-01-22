const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./config/db');
require('dotenv').config();

// Import Controllers
const authController = require('./controllers/authController');
const userController = require('./controllers/userController');
const adminController = require('./controllers/adminController'); // 👈 คอนโทรลเลอร์ใหม่ที่เราเพิ่งสร้าง

const app = express();
const server = http.createServer(app);

// ตั้งค่า Socket.io (ระบบแชท)
const io = new Server(server, { 
    cors: { origin: "*" } 
});

app.use(cors());

// ✅ ตั้งค่ารับไฟล์ขนาดใหญ่ (รูปภาพ) สูงสุด 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => res.send('Backend is running! 🚀'));

// ==========================
// 🔗 API Routes
// ==========================

// 1. ระบบสมาชิก (Auth)
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// 2. จัดการโปรไฟล์ (User Profile)
app.get('/api/profile/:id', userController.getProfile);
app.put('/api/profile/update', userController.updateProfile);

// 3. ระบบแอดมิน (Admin Dashboard)
app.get('/api/admin/stats', adminController.getStats);   // ดึงสถิติ
app.get('/api/admin/users', adminController.getAllUsers); // ดูรายชื่อสมาชิก
app.post('/api/admin/ban', adminController.banUser);     // แบน/ปลดแบน

// 4. จัดการหนังสือ (Books Management)
// ดึงข้อมูลหนังสือทั้งหมด (ใช้ SELECT * เพื่อให้ได้รูปและหมวดหมู่ด้วย)
app.get('/api/books', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM books ORDER BY id DESC');
        res.json(rows);
    } catch (err) { 
        console.error(err);
        res.status(500).json({ error: err.message }); 
    }
});

// เพิ่มหนังสือใหม่ (Admin Only)
app.post('/api/books', adminController.addBook);

// ลบหนังสือ (Admin Only)
app.delete('/api/books/:id', adminController.deleteBook);


// ==========================
// 💬 Socket.io (Chat System)
// ==========================
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    // เข้าห้องส่วนตัว (ตาม User ID)
    socket.on('join_room', (userId) => {
        socket.join(userId);
    });

    // รับ-ส่งข้อความ
    socket.on('send_message', (data) => {
        // ส่งข้อความไปหาทุกคน (Broadcast) หรือปรับให้ส่งเฉพาะคนก็ได้
        io.emit('receive_message', data);
    });

    socket.on('disconnect', () => {
        console.log('User Disconnected', socket.id);
    });
});

// ==========================
// 🚀 Start Server
// ==========================
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));