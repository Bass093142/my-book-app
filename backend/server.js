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
const orderController = require('./controllers/orderController'); // ✅ ต้องมีบรรทัดนี้

const app = express();
const server = http.createServer(app);

// ตั้งค่า Socket.io
const io = new Server(server, { 
    cors: { origin: "*" } 
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ Route เช็คสถานะ (เอาไว้ดูว่า Server อัปเดตหรือยัง)
app.get('/', (req, res) => res.send('Backend is updated! (Version Final) 🚀'));

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

// Books Routes
app.get('/api/books', async (req, res) => {
    try { const [rows] = await pool.query('SELECT * FROM books ORDER BY id DESC'); res.json(rows); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/books', adminController.addBook);
app.delete('/api/books/:id', adminController.deleteBook);

// ✅ Categories Routes (แก้ปัญหาลบไม่ได้ 404)
app.get('/api/categories', adminController.getCategories);
app.post('/api/categories', adminController.addCategory);
app.delete('/api/categories/:id', adminController.deleteCategory); // 👈 ต้องมีบรรทัดนี้

// 3. Orders Routes (แก้ปัญหาสั่งซื้อไม่ได้)
app.post('/api/orders', orderController.createOrder);
app.get('/api/admin/orders', orderController.getAllOrders);
app.put('/api/admin/orders/:id', orderController.updateOrderStatus);

// 4. Chat System
app.get('/api/chat/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const [rows] = await pool.query(`SELECT * FROM chat_messages WHERE sender_id = ? OR receiver_id = ? ORDER BY created_at ASC`, [userId, userId]);
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Socket.io Events
io.on('connection', (socket) => {
    console.log(`User Connected: ${socket.id}`);
    socket.on('join_room', (userId) => { socket.join(userId); });
    socket.on('send_message', async (data) => {
        io.to(data.receiver_id).emit('receive_message', data);
        socket.emit('receive_message', data);
        if(data.receiver_id === 'admin') { io.emit('receive_message_admin', data); }
        try { await pool.query('INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)', [data.sender_id, data.receiver_id, data.message]); } catch (err) { console.error(err); }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));