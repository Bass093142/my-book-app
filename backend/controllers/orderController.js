const pool = require('../config/db');

// สั่งซื้อสินค้า
exports.createOrder = async (req, res) => {
    try {
        const { user_id, items, total_price, slip_image } = req.body;

        if (!items || items.length === 0) return res.status(400).json({ message: 'ตะกร้าว่างเปล่า' });

        // 1. สร้าง Order
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total_price, status, payment_slip_url) VALUES (?, ?, ?, ?)',
            [user_id, total_price, 'pending', slip_image || '']
        );
        const orderId = orderResult.insertId;

        // 2. บันทึกรายการสินค้า
        for (const item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.price]
            );
        }

        res.status(201).json({ message: 'สั่งซื้อสำเร็จ!', orderId });
    } catch (error) {
        console.error("Order Error:", error);
        res.status(500).json({ message: 'สั่งซื้อไม่สำเร็จ: ' + error.message });
    }
};

// ดึงออเดอร์ทั้งหมด
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

// อัปเดตสถานะ
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'อัปเดตสถานะเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};