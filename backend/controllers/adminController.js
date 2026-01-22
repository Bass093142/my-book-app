const pool = require('../config/db');

// ดึงสถิติรวม (Stats)
exports.getStats = async (req, res) => {
    try {
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [bookCount] = await pool.query('SELECT COUNT(*) as count FROM books');
        
        res.json({
            users: userCount[0].count,
            books: bookCount[0].count,
            sales: 0, // สมมติไปก่อน
            chartSeries: [bookCount[0].count, userCount[0].count, 0, 0] 
        });
    } catch (error) {
        console.error("Get Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ดึงรายชื่อสมาชิก
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, email, first_name, last_name, role, is_banned FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// แบนสมาชิก
exports.banUser = async (req, res) => {
    try {
        const { id, is_banned, ban_reason } = req.body;
        await pool.query('UPDATE users SET is_banned = ?, ban_reason = ? WHERE id = ?', [is_banned, ban_reason, id]);
        res.json({ message: 'อัปเดตสถานะสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ ฟังก์ชันเพิ่มหนังสือ (จุดที่น่าจะ Error)
exports.addBook = async (req, res) => {
    try {
        // รับค่าจากหน้าบ้าน
        const { title, author, price, category, description, image, stock } = req.body;
        
        console.log("Adding book:", title); // log ดูว่าข้อมูลมาไหม

        // แปลงค่า price กับ stock ให้เป็นตัวเลขแน่นอน (กัน Error)
        const safePrice = parseFloat(price) || 0;
        const safeStock = parseInt(stock) || 10;

        // บันทึกลง Database
        // ⚠️ ถ้า Database ไม่มีช่อง image หรือ description มันจะพังตรงนี้
        await pool.query(
            'INSERT INTO books (title, author, price, category, description, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, author || 'Unknown', safePrice, category, description || '', image || '', safeStock]
        );

        res.status(201).json({ message: 'เพิ่มหนังสือสำเร็จ!' });
    } catch (error) {
        console.error("Add Book Error:", error); // ดู Log นี้ใน Render ถ้าพัง
        res.status(500).json({ message: 'เพิ่มหนังสือไม่สำเร็จ: ' + error.message });
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