const pool = require('../config/db');

// สั่งซื้อสินค้า (Create Order) - ของเดิม
exports.createOrder = async (req, res) => {
    try {
        const { user_id, items, total_price, slip_image } = req.body;

        if (!items || items.length === 0) return res.status(400).json({ message: 'ตะกร้าสินค้าว่างเปล่า' });

        // 1. สร้าง Order หลัก
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total_price, status, payment_slip_url) VALUES (?, ?, ?, ?)',
            [user_id, total_price, 'pending', slip_image || '']
        );
        const orderId = orderResult.insertId;

        // 2. วนลูปสินค้าในตะกร้า
        for (const item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.price]
            );
        }

        res.status(201).json({ message: 'สั่งซื้อสำเร็จ!', orderId });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: 'การสั่งซื้อล้มเหลว: ' + error.message });
    }
};

// ดึงออเดอร์ทั้งหมด (สำหรับ Admin) - ของเดิม
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

// ✅ [เพิ่มใหม่] ดึงออเดอร์เฉพาะของ User คนนั้น (สำหรับหน้า Home)
exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.params.userId;
        const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// อัปเดตสถานะออเดอร์ (Update Status) - ของเดิม
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'อัปเดตสถานะเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ✅ [เพิ่มใหม่] ลบออเดอร์ + แจ้งเหตุผลลูกค้า (Delete Order with Reason)
exports.deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body; // รับเหตุผลที่แอดมินพิมพ์มา

        // 1. หาเจ้าของออเดอร์ก่อน
        const [order] = await pool.query('SELECT user_id FROM orders WHERE id = ?', [id]);
        if (order.length === 0) return res.status(404).json({ message: 'ไม่พบออเดอร์' });
        
        const userId = order[0].user_id;

        // 2. ส่งข้อความแจ้งเตือนไปในระบบแชท (แจ้งเหตุผล)
        const msg = `⚠️ คำสั่งซื้อ #${id} ถูกลบออกจากระบบ เนื่องจาก: ${reason || 'ไม่ระบุเหตุผล'}`;
        await pool.query('INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)', ['admin', userId, msg]);

        // 3. ลบออเดอร์จริงๆ
        await pool.query('DELETE FROM orders WHERE id = ?', [id]);

        res.json({ message: 'ลบออเดอร์และแจ้งเตือนลูกค้าเรียบร้อยแล้ว' });
    } catch (error) {
        console.error("Delete Order Error:", error);
        res.status(500).json({ message: error.message });
    }
};