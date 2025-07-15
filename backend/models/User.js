const { pool } = require('../db');

class User {
    static async findByEmail(email) {
        const [rows] = await pool.query('SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?', [email]);
        return rows[0];
    }

    static async create(name, email, passwordHash, roleId) {
        const [result] = await pool.query(
            'INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
            [name, email, passwordHash, roleId]
        );
        return result.insertId;
    }

    static async getRoleByName(roleName) {
        console.log('role name', roleName)
        const [rows] = await pool.query('SELECT id FROM roles WHERE name = ?', [roleName]);
        return rows[0];
    }
}

module.exports = User;
