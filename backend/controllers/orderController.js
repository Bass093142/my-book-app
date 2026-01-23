const pool = require('../config/db');

exports.createOrder = async (req, res) => {
    try {
        // ✅ แก้ slip_image เป็น payment_slip_url ให้ตรงกับ DB
        const { user_id, items, total_price, payment_slip_url } = req.body;
        
        if (!items || items.length === 0) return res.status(400).json({ message: 'ตะกร้าว่างเปล่า' });

        // ✅ แก้ SQL ตรงนี้ด้วย
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, total_price, status, payment_slip_url) VALUES (?, ?, ?, ?)',
            [user_id, total_price, 'pending', payment_slip_url || '']
        );
        const orderId = orderResult.insertId;

        for (const item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.price]
            );
        }
        res.status(201).json({ message: 'สั่งซื้อสำเร็จ!', orderId });
    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: 'สั่งซื้อไม่สำเร็จ: ' + error.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        // ✅ แก้ o.slip_image เป็น o.payment_slip_url
        const [orders] = await pool.query(`
            SELECT o.id, o.total_price, o.status, o.created_at, o.payment_slip_url, 
                   u.first_name, u.email 
            FROM orders o 
            JOIN users u ON o.user_id = u.id 
            ORDER BY o.created_at DESC
        `);
        res.json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'อัปเดตสถานะสำเร็จ' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};