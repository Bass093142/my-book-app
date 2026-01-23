const pool = require('../config/db');

// ==========================================
// 1. ส่วนจัดการสถิติ (Dashboard Stats) - ของเดิม
// ==========================================
exports.getStats = async (req, res) => {
    try {
        // นับจำนวน User
        const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
        
        // นับจำนวนหนังสือ
        const [bookCount] = await pool.query('SELECT COUNT(*) as count FROM books');
        
        // คำนวณยอดขายรวม และจำนวนออเดอร์ (เฉพาะที่ยังไม่ยกเลิก)
        const [orderStats] = await pool.query('SELECT IFNULL(SUM(total_price), 0) as total_sales, COUNT(*) as total_orders FROM orders WHERE status != "cancelled"');
        
        // ข้อมูลกราฟ 1: สัดส่วนเพศ
        const [genderStats] = await pool.query('SELECT gender, COUNT(*) as count FROM users GROUP BY gender');
        
        // ข้อมูลกราฟ 2: ยอดขายรายวัน (ย้อนหลัง 7 วัน)
        const [salesStats] = await pool.query(`
            SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as date, SUM(total_price) as total 
            FROM orders 
            WHERE status != 'cancelled' 
            GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') 
            ORDER BY date DESC LIMIT 7
        `);

        // ส่งข้อมูลกลับไปหน้าบ้าน
        res.json({
            users: userCount[0].count,
            books: bookCount[0].count,
            sales: orderStats[0].total_sales || 0,
            orders: orderStats[0].total_orders || 0,
            genderData: genderStats,
            salesData: salesStats
        });
    } catch (error) {
        console.error("Get Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 2. ส่วนจัดการสมาชิก (User Management) - ของเดิม
// ==========================================
exports.getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, email, first_name, last_name, role, is_banned FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.banUser = async (req, res) => {
    try {
        const { id, is_banned, ban_reason } = req.body;
        // อัปเดตสถานะการแบน
        await pool.query('UPDATE users SET is_banned = ?, ban_reason = ? WHERE id = ?', [is_banned, ban_reason, id]);
        res.json({ message: 'Success: User status updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 3. ส่วนจัดการหนังสือ (Books Management) - ของเดิม
// ==========================================
exports.addBook = async (req, res) => {
    try {
        // รับค่าทั้งหมดที่ส่งมาจากหน้าบ้าน
        const { title, author, price, category, description, image, stock } = req.body;

        // แปลงค่าให้ปลอดภัย (Validation)
        const safePrice = parseFloat(price) || 0;
        const safeStock = parseInt(stock) || 10;
        const safeAuthor = author || 'Unknown';
        const safeDesc = description || '';
        const safeImage = image || '';

        // บันทึกลง Database
        await pool.query(
            'INSERT INTO books (title, author, price, category, description, image, stock) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [title, safeAuthor, safePrice, category, safeDesc, safeImage, safeStock]
        );

        res.status(201).json({ message: 'Success: Book added successfully' });
    } catch (error) {
        console.error("Add Book Error:", error);
        res.status(500).json({ message: 'Error adding book: ' + error.message });
    }
};

exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM books WHERE id = ?', [id]);
        res.json({ message: 'Success: Book deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==========================================
// 4. ส่วนจัดการหมวดหมู่ (Categories CRUD) - เพิ่มให้ครบ
// ==========================================

// 4.1 อ่านหมวดหมู่ (Read)
exports.getCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categories');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4.2 เพิ่มหมวดหมู่ (Create)
exports.addCategory = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        await pool.query('INSERT INTO categories (name) VALUES (?)', [name]);
        res.json({ message: 'Success: Category added' });
    } catch (error) {
        console.error("Add Category Error:", error);
        res.status(500).json({ message: 'Error: Category name likely exists' });
    }
};

// 4.3 แก้ไขหมวดหมู่ (Update) - **เพิ่มใหม่**
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        await pool.query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
        res.json({ message: 'Success: Category updated' });
    } catch (error) {
        console.error("Update Category Error:", error);
        res.status(500).json({ message: 'Update failed' });
    }
};

// 4.4 ลบหมวดหมู่ (Delete) - **เพิ่มเช็ค Foreign Key**
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // ลองลบดู
        await pool.query('DELETE FROM categories WHERE id = ?', [id]);
        
        res.json({ message: 'Success: Category deleted' });

    } catch (error) {
        console.error("Delete Category Error:", error);
        
        // เช็ค Error Code ของ MySQL กรณีลบไม่ได้เพราะมีหนังสือใช้อยู่ (Foreign Key Constraint)
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
             return res.status(409).json({ 
                 message: 'ไม่สามารถลบได้ เนื่องจากมีหนังสืออยู่ในหมวดหมู่นี้ (กรุณาลบหนังสือออกก่อน)' 
             });
        }
        
        res.status(500).json({ message: 'Delete failed: ' + error.message });
    }
};