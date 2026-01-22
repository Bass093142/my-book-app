const pool = require('../config/db');

const checkMaintenance = async (req, res, next) => {
    // ข้าม check ถ้าเป็น admin login
    if (req.path.includes('/admin-login')) return next();

    const [rows] = await pool.query("SELECT setting_value FROM system_settings WHERE setting_key = 'maintenance_mode'");
    if (rows.length > 0 && rows[0].setting_value === 'true') {
        return res.status(503).json({ message: 'ระบบกำลังปิดปรับปรุงชั่วคราว' });
    }
    next();
};

module.exports = checkMaintenance;