const pool = require('../config/db');

// ดึงสถิติรวม
exports.getStats = async (req, res) => {
    try {
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [bookCount] = await pool.query('SELECT COUNT(*) as count FROM books');
        // ใช้ IFNULL กัน Error กรณีไม่มีข้อมูล
        const [orderStats] = await pool.query('SELECT IFNULL(SUM(total_price), 0) as total_sales, COUNT(*) as total_orders FROM orders WHERE status != "cancelled"');
        const [genderStats] = await pool.query('SELECT gender, COUNT(*) as count FROM users GROUP BY gender');
        const [salesStats] = await pool.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, SUM(total_price) as total 
            FROM orders WHERE status != 'cancelled' 
            GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') 
            ORDER BY date DESC LIMIT 7
        `);

        res.json({
            users: userCount[0].count,
            books: bookCount[0].count,
            sales: orderStats[0].total_sales || 0,
            orders: orderStats[0].total_orders || 0,
            genderData: genderStats,
            salesData: salesStats
        });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, email, first_name, last_name, role, is_banned FROM users');
        res.json(users);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.banUser = async (req, res) => {
    try {
        const { id, is_banned, ban_reason } = req.body;
        await pool.query('UPDATE users SET is_banned = ?, ban_reason = ? WHERE id = ?', [is_banned, ban_reason, id]);
        res.json({ message: 'Success' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- Books ---
exports.addBook = async (req, res) => {
    try {
        const { title, author, price, category, description, image, stock } = req.body;
        await pool.query(
            'INSERT INTO books (title, author, price, category, description, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, author || 'Unknown', parseFloat(price)||0, category, description || '', image || '', parseInt(stock)||10]
        );
        res.status(201).json({ message: 'Success' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deleteBook = async (req, res) => {
    try {
        await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
        res.json({ message: 'Success' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- Categories (แก้จุดนี้) ---
exports.getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.json({ message: 'Success' });
    } catch (error) { 
        res.status(500).json({ message: 'ชื่อหมวดหมู่ซ้ำหรือเกิดข้อผิดพลาด' }); 
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        // ลบเลย (ถ้าติด Foreign Key มันจะเด้งไป catch)
        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        res.json({ message: 'Success' });
    } catch (error) { 
        console.error(error);
        // แจ้ง Error ชัดๆ ว่าลบไม่ได้เพราะมีหนังสือใช้อยู่
        res.status(400).json({ message: 'ไม่สามารถลบได้ เนื่องจากมีหนังสืออยู่ในหมวดหมู่นี้' }); 
    }
};