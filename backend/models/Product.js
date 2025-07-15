const { pool } = require('../db');

class Product {
  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateQuantity(id, quantity) {
    const [result] = await pool.query('UPDATE products SET quantity = ? WHERE id = ?', [quantity, id]);
    return result.affectedRows;
  }
}

module.exports = Product;