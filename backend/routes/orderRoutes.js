const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const InventoryLog = require('../models/InventoryLog');
const Product = require('../models/Product');

// Get all orders
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT
                o.id AS order_id,
                o.order_number,
                o.status AS order_status,
                o.created_at,
                u.name AS user_name,
                u.email AS user_email,
                p.name AS product_name,
                p.master_sku AS product_sku,
                p.price AS product_price
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN products p ON o.product_id = p.id
            ORDER BY o.created_at DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get order by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query(`
            SELECT
                o.id AS order_id,
                o.order_number,
                o.status AS order_status,
                o.created_at,
                u.name AS user_name,
                u.email AS user_email,
                p.name AS product_name,
                p.master_sku AS product_sku,
                p.price AS product_price
            FROM orders o
            JOIN users u ON o.user_id = u.id
            JOIN products p ON o.product_id = p.id
            WHERE o.id = ?
        `, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new order
router.post('/', async (req, res) => {
    let { user_id, product_id, order_number, quantity, status } = req.body;

    // Default quantity to 1 if not provided or invalid
    if (isNaN(parseInt(quantity))) {
        quantity = 1;
    }
    try {
        // Check product availability
        const product = await Product.findById(product_id);
        if (!product || product.quantity < quantity) {
            return res.status(400).json({ message: 'Product not available or insufficient stock' });
        }

        // Create order
        const [orderResult] = await pool.query(
            'INSERT INTO orders (user_id, product_id, order_number, status) VALUES (?, ?, ?, ?)',
            [user_id, product_id, order_number, status]
        );
        const orderId = orderResult.insertId;

        // Update product quantity
        const newQuantity = product.quantity - quantity;
        await Product.updateQuantity(product_id, newQuantity);

        // Log inventory change
        await InventoryLog.create('outbound', quantity, product_id);

        res.status(201).json({ message: 'Order created successfully', orderId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update order status
router.put('/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json({ message: 'Order status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
