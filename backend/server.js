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
const orderController = require('./controllers/orderController'); // ✅ อย่าลืมสร้างไฟล์นี้ (ตามที่ให้ไปรอบก่อน)

const app = express();
const server = http.createServer(app);

// ตั้งค่า Socket.io
const io = new Server(server, { 
    cors: { origin: "*" } 
});

app.use(cors());
// รับไฟล์ใหญ่ 50MB (เผื่อรูปภาพ)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => res.send('Backend is running! 🚀'));

// ==========================
// 🔗 API Routes (รวมมิตร)
// ==========================

// 1. ระบบสมาชิก (Auth)
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// 2. ข้อมูลส่วนตัว (Profile)
app.get('/api/profile/:id', userController.getProfile);
app.put('/api/profile/update', userController.updateProfile);

// 3. ระบบแอดมิน (Admin Stats & Management)
app.get('/api/admin/stats', adminController.getStats);
app.get('/api/admin/users', adminController.getAllUsers);
app.post('/api/admin/ban', adminController.banUser);

// 4. ระบบหนังสือ (Books)
app.get('/api/books', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM books ORDER BY id DESC');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/books', adminController.addBook);
app.delete('/api/books/:id', adminController.deleteBook);

// 5. ✅ ระบบหมวดหมู่ (Categories) - เพิ่มใหม่
app.get('/api/categories', adminController.getCategories);
app.post('/api/categories', adminController.addCategory);
app.delete('/api/categories/:id', adminController.deleteCategory);

// 6. ✅ ระบบออเดอร์ (Orders) - เพิ่มใหม่
app.post('/api/orders', orderController.createOrder); // ลูกค้าสั่ง
app.get('/api/admin/orders', orderController.getAllOrders); // แอดมินดู
app.put('/api/admin/orders/:id', orderController.updateOrderStatus); // เปลี่ยนสถานะ

// 7. ระบบแชท (Chat History)
app.get('/api/chat/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const [rows] = await pool.query(
            `SELECT * FROM chat_messages 
             WHERE sender_id = ? OR receiver_id = ? 
             ORDER BY created_at ASC`, 
            [userId, userId]
        );
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// ==========================
// 💬 Socket.io (Real-time Chat)
// ==========================
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on('join_room', (userId) => {
        socket.join(userId);
    });

    socket.on('send_message', async (data) => {
        console.log("Msg received:", data);
        
        // ส่งหาคู่สนทนา
        io.to(data.receiver_id).emit('receive_message', data);
        // ส่งกลับหาตัวเอง (อัปเดตหน้าจอ)
        socket.emit('receive_message', data);

        // ถ้าส่งหาแอดมิน ให้แจ้งเตือนห้องแอดมิน
        if(data.receiver_id === 'admin') {
             io.emit('receive_message_admin', data); 
        }

        // บันทึกลงฐานข้อมูล
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