const { pool } = require('../db');

class InventoryLog {
  static async create(change_type, quantity, product_id) {
    const [result] = await pool.query(
      'INSERT INTO inventory_logs (change_type, quantity, product_id) VALUES (?, ?, ?)',
      [change_type, quantity, product_id]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await pool.query(`
      SELECT
        il.id,
        il.change_type,
        il.quantity,
        il.timestamp,
        p.name AS product_name,
        p.master_sku AS product_sku
      FROM inventory_logs il
      JOIN products p ON il.product_id = p.id
      ORDER BY il.timestamp DESC
    `);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM inventory_logs WHERE id = ?',
      [id]
    );
    return rows[0];
  }
}

module.exports = InventoryLog;
