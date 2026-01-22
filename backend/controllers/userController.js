const pool = require('../config/db');

exports.getProfile = async (req, res) => {
    try {
        const [users] = await pool.query('SELECT id, prefix, first_name, last_name, email, role, profile_image FROM users WHERE id = ?', [req.params.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { id, prefix, first_name, last_name, profile_image } = req.body;
        
        await pool.query(
            `UPDATE users SET prefix = ?, first_name = ?, last_name = ?, profile_image = ? WHERE id = ?`,
            [prefix, first_name, last_name, profile_image, id]
        );

        res.json({ message: 'อัปเดตข้อมูลสำเร็จ!', user: { id, prefix, first_name, last_name, profile_image } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Update failed' });
    }
};