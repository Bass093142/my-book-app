const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { prefix, email, password, gender, security_question, security_answer } = req.body;
        
        // เช็คอีเมลซ้ำ
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });

        // เข้ารหัส
        const hashedPassword = await bcrypt.hash(password, 10);

        // บันทึก
        await pool.query(
            `INSERT INTO users (prefix, email, password_hash, gender, role, security_question, security_answer) 
             VALUES (?, ?, ?, ?, 'user', ?, ?)`,
            [prefix, email, hashedPassword, gender, security_question, security_answer]
        );

        res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) return res.status(400).json({ message: 'ไม่พบผู้ใช้งาน' });
        const user = users[0];

        if (user.is_banned) return res.status(403).json({ message: `ถูกระงับ: ${user.ban_reason}` });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'รหัสผ่านผิด' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, email: user.email, role: user.role, prefix: user.prefix } });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};