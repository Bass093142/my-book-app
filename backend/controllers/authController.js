const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        // 👇 รับค่า first_name, last_name มาด้วย
        const { prefix, first_name, last_name, email, password, gender, security_question, security_answer } = req.body;
        
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // 👇 เพิ่ม SQL ให้บันทึกชื่อ-นามสกุล
        await pool.query(
            `INSERT INTO users (prefix, first_name, last_name, email, password_hash, gender, role, security_question, security_answer) 
             VALUES (?, ?, ?, ?, ?, ?, 'user', ?, ?)`,
            [prefix, first_name, last_name, email, hashedPassword, gender, security_question, security_answer]
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

        if (user.is_banned) return res.status(403).json({ message: `บัญชีถูกระงับ: ${user.ban_reason}` });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) return res.status(400).json({ message: 'รหัสผ่านผิด' });

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        // ส่งข้อมูลโปรไฟล์กลับไปให้ Frontend เก็บไว้ใช้
        res.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role, 
                prefix: user.prefix,
                first_name: user.first_name, 
                last_name: user.last_name,
                profile_image: user.profile_image 
            } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};