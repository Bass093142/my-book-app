const pool = require('../config/db');

// สั่งซื้อสินค้า
exports.createOrder = async (req, res) => {
    try {
        const { user_id, items, total_price, slip_image } = req.body;

        // 1. สร้าง Order
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total_price, status, slip_image) VALUES (?, ?, ?, ?)',
            [user_id, total_price, 'pending', slip_image || '']
        );
        const orderId = orderResult.insertId;

        // 2. ใส่รายการสินค้าลง order_items
        for (const item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.price]
            );
        }

        res.status(201).json({ message: 'สั่งซื้อสำเร็จ!', orderId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'สั่งซื้อล้มเหลว' });
    }
};

// ดึงออเดอร์ทั้งหมด (สำหรับ Admin)
exports.getAllOrders = async (req, res) => {
    try {
        const [orders] = await pool.query(`
            SELECT o.id, o.total_price, o.status, o.created_at, o.slip_image, 
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

// อัปเดตสถานะออเดอร์
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'อัปเดตสถานะเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};