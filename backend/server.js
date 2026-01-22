const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const pool = require('./config/db');
const authController = require('./controllers/authController');
const userController = require('./controllers/userController'); // 👈 เพิ่มบรรทัดนี้
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
// 👇 เพิ่มบรรทัดนี้เพื่อให้ส่งรูปใหญ่ๆ ได้ (50MB)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => res.send('Backend is running!'));

// Auth Routes
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);

// User Profile Routes (ใหม่) 👇
app.get('/api/profile/:id', userController.getProfile);
app.put('/api/profile/update', userController.updateProfile);

app.get('/api/books', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM books');
        res.json(rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));