const pool = require('../config/db');

// 1. Stats
exports.getStats = async (req, res) => {
    try {
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [bookCount] = await pool.query('SELECT COUNT(*) as count FROM books');
        const [orderStats] = await pool.query('SELECT IFNULL(SUM(total_price), 0) as total_sales, COUNT(*) as total_orders FROM orders WHERE status != "cancelled"');
        const [genderStats] = await pool.query('SELECT gender, COUNT(*) as count FROM users GROUP BY gender');
        const [salesStats] = await pool.query(`SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, SUM(total_price) as total FROM orders WHERE status != 'cancelled' GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') ORDER BY date DESC LIMIT 7`);

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

// 2. Users
exports.getAllUsers = async (req, res) => {
    try { const [users] = await pool.query('SELECT id, email, first_name, last_name, role, is_banned FROM users'); res.json(users); } 
    catch (error) { res.status(500).json({ message: error.message }); }
};

exports.banUser = async (req, res) => {
    try {
        const { id, is_banned, ban_reason } = req.body;
        await pool.query('UPDATE users SET is_banned = ?, ban_reason = ? WHERE id = ?', [is_banned, ban_reason, id]);
        res.json({ message: 'Success' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 3. Books
exports.addBook = async (req, res) => {
    try {
        const { title, author, price, category_id, description, image, stock } = req.body;
        await pool.query(
            'INSERT INTO books (title, author, price, category_id, description, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, author || 'Unknown', parseFloat(price)||0, category_id || null, description || '', image || '', parseInt(stock)||10]
        );
        res.status(201).json({ message: 'Success: Book added' });
    } catch (error) { 
        console.error("Add Book Error:", error);
        res.status(500).json({ message: error.message }); 
    }
};

// ✅ [เพิ่มใหม่] แก้ไขหนังสือ (เอาไว้เติมสต๊อก หรือแก้ราคา)
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, price, category_id, description, image, stock } = req.body;

        // ถ้ามีการส่งรูปใหม่มา ให้อัปเดตทุกช่อง
        if (image) {
            await pool.query(
                'UPDATE books SET title=?, author=?, price=?, category_id=?, description=?, image=?, stock=? WHERE id=?',
                [title, author, price, category_id, description, image, stock, id]
            );
        } else {
            // ถ้าไม่แก้รูป (ใช้รูปเดิม)
            await pool.query(
                'UPDATE books SET title=?, author=?, price=?, category_id=?, description=?, stock=? WHERE id=?',
                [title, author, price, category_id, description, stock, id]
            );
        }
        res.json({ message: 'แก้ไขข้อมูล/เติมสต๊อก เรียบร้อย' });
    } catch (error) {
        console.error("Update Book Error:", error);
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
        res.json({ message: 'Success' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

// 4. Categories
exports.getCategories = async (req, res) => {
    try { const [rows] = await pool.query('SELECT * FROM categories'); res.json(rows); } 
    catch (error) { res.status(500).json({ message: error.message }); }
};

exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Category name required' });
        await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.json({ message: 'Success' });
    } catch (error) { res.status(500).json({ message: 'Duplicate or Error' }); }
};

exports.updateCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name required' });
        await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, req.params.id]);
        res.json({ message: 'Success' });
    } catch (error) { res.status(500).json({ message: 'Error' }); }
};

exports.deleteCategory = async (req, res) => {
    try {
        await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
        res.json({ message: 'Success' });
    } catch (error) { 
        if(error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ message: 'ลบไม่ได้ มีข้อมูลใช้งานอยู่' });
        res.status(500).json({ message: error.message }); 
    }
};