const pool = require('../config/db');

// สั่งซื้อสินค้า (เวอร์ชันตัดสต๊อก)
exports.createOrder = async (req, res) => {
    // ต้องใช้ Connection แยก เพื่อทำ Transaction (ถ้าตัดสต๊อกพลาด ต้องยกเลิกออเดอร์ทั้งหมด)
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction(); // เริ่มต้นกระบวนการ

        const { user_id, items, total_price, slip_image } = req.body;

        if (!items || items.length === 0) {
            throw new Error('ตะกร้าสินค้าว่างเปล่า');
        }

        // 1. 🔍 เช็คสต๊อกก่อน! ว่ามีของพอไหม
        for (const item of items) {
            const [rows] = await connection.query('SELECT title, stock FROM books WHERE id = ?', [item.id]);
            if (rows.length === 0) {
                throw new Error(`ไม่พบสินค้า ID: ${item.id}`);
            }
            const book = rows[0];
            if (book.stock < item.quantity) {
                throw new Error(`สินค้า "${book.title}" หมดแล้ว (หรือมีไม่พอ)`);
            }
        }

        // 2. 📝 สร้าง Order หลัก
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_price, status, payment_slip_url) VALUES (?, ?, ?, ?)',
            [user_id, total_price, 'pending', slip_image || '']
        );
        const orderId = orderResult.insertId;

        // 3. 📦 วนลูปสินค้า -> บันทึก + ตัดสต๊อก
        for (const item of items) {
            // บันทึกลงตาราง order_items
            await connection.query(
                'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.price]
            );

            // 🔥 ตัดสต๊อกหนังสือ!
            await connection.query(
                'UPDATE books SET stock = stock - ? WHERE id = ?',
                [item.quantity, item.id]
            );
        }

        await connection.commit(); // ยืนยันการทำงานทั้งหมด
        res.status(201).json({ message: 'สั่งซื้อสำเร็จ! ตัดสต๊อกเรียบร้อย', orderId });

    } catch (error) {
        await connection.rollback(); // ถ้ามีอะไรพลาด ให้ยกเลิกทั้งหมด (คืนสต๊อก)
        console.error("Create Order Error:", error);
        res.status(500).json({ message: 'การสั่งซื้อล้มเหลว: ' + error.message });
    } finally {
        connection.release(); // คืน Connection
    }
};

// ดึงออเดอร์ทั้งหมด (เหมือนเดิม)
exports.getAllOrders = async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT o.id, o.total_price, o.status, o.created_at, o.payment_slip_url, 
                   u.first_name, u.email 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ดึงออเดอร์ของ User (เหมือนเดิม)
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.params.userId;
        const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// อัปเดตสถานะ (เหมือนเดิม)
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'อัปเดตสถานะเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ลบออเดอร์ (เหมือนเดิม)
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const [order] = await pool.query('SELECT user_id FROM orders WHERE id = ?', [id]);
        if (order.length === 0) return res.status(404).json({ message: 'ไม่พบออเดอร์' });
        
        const userId = order[0].user_id;

        const msg = `⚠️ คำสั่งซื้อ #${id} ถูกลบออกจากระบบ เนื่องจาก: ${reason || 'ไม่ระบุเหตุผล'}`;
        await pool.query('INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)', ['admin', userId, msg]);

        await pool.query('DELETE FROM orders WHERE id = ?', [id]);

        res.json({ message: 'ลบออเดอร์เรียบร้อย' });
    } catch (error) {
        console.error("Delete Order Error:", error);
        res.status(500).json({ message: error.message });
    }
};