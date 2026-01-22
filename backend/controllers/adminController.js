const pool = require('../config/db');

// ดึงสถิติรวม (Users, Sales, Books)
exports.getStats = async (req, res) => {
    try {
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [bookCount] = await pool.query('SELECT COUNT(*) as count FROM books');
        // สมมติยอดขาย (ถ้ามีตาราง orders ค่อยเปลี่ยนเป็น SELECT SUM(total) FROM orders)
        const sales = 15000; 

        res.json({
            users: userCount[0].count,
            books: bookCount[0].count,
            sales: sales,
            // กราฟจำลอง (Mock)
            chartSeries: [bookCount[0].count, userCount[0].count, 10, 5] 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ดึงรายชื่อสมาชิกทั้งหมด
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, email, first_name, last_name, role, is_banned, ban_reason FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// แบน/ปลดแบน สมาชิก
exports.banUser = async (req, res) => {
    try {
        const { id, is_banned, ban_reason } = req.body;
        await pool.query('UPDATE users SET is_banned = ?, ban_reason = ? WHERE id = ?', [is_banned, ban_reason, id]);
        res.json({ message: 'อัปเดตสถานะผู้ใช้สำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// เพิ่มหนังสือใหม่
exports.addBook = async (req, res) => {
    try {
        const { title, author, price, category, description, image, stock } = req.body;
        await pool.query(
            'INSERT INTO books (title, author, price, category, description, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, author, price, category, description, image, stock || 10]
        );
        res.status(201).json({ message: 'เพิ่มหนังสือสำเร็จ!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'เพิ่มหนังสือไม่สำเร็จ' });
    }
};

// ลบหนังสือ
exports.deleteBook = async (req, res) => {
    try {
        await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
        res.json({ message: 'ลบหนังสือสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};