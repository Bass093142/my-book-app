const pool = require('../config/db');

// ✅ 1. ดึงสถิติรวม + ข้อมูลกราฟ (Dashboard Stats)
exports.getStats = async (req, res) => {
    try {
        // นับจำนวน User, Books
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [bookCount] = await pool.query('SELECT COUNT(*) as count FROM books');
        
        // คำนวณยอดขายรวม และจำนวนออเดอร์
        const [orderStats] = await pool.query('SELECT SUM(total_price) as total_sales, COUNT(*) as total_orders FROM orders WHERE status != "cancelled"');

        // 📊 กราฟ 1: สถิติเพศผู้ใช้งาน
        const [genderStats] = await pool.query('SELECT gender, COUNT(*) as count FROM users GROUP BY gender');
        
        // 📊 กราฟ 2: ยอดขายรายวัน (7 วันล่าสุด)
        const [salesStats] = await pool.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, SUM(total_price) as total 
            FROM orders 
            WHERE status != 'cancelled' 
            GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') 
            ORDER BY date DESC LIMIT 7
        `);

        res.json({
            users: userCount[0].count,
            books: bookCount[0].count,
            sales: orderStats[0].total_sales || 0,
            orders: orderStats[0].total_orders || 0,
            genderData: genderStats, // ส่งข้อมูลกราฟเพศไปหน้าบ้าน
            salesData: salesStats    // ส่งข้อมูลกราฟยอดขายไปหน้าบ้าน
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

// เพิ่มหนังสือ
exports.addBook = async (req, res) => {
    try {
        const { title, author, price, category, description, image, stock } = req.body;
        const safePrice = parseFloat(price) || 0;
        const safeStock = parseInt(stock) || 10;

        await pool.query(
            'INSERT INTO books (title, author, price, category, description, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, author || 'Unknown', safePrice, category, description || '', image || '', safeStock]
        );

        res.status(201).json({ message: 'เพิ่มหนังสือสำเร็จ!' });
    } catch (error) {
        console.error("Add Book Error:", error);
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

// ✅ 2. จัดการหมวดหมู่ (Categories)
exports.getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.json({ message: 'เพิ่มหมวดหมู่สำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: 'เพิ่มหมวดหมู่ไม่สำเร็จ (ชื่ออาจซ้ำ)' });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'ลบหมวดหมู่สำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};