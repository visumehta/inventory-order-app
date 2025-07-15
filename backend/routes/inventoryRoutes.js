const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const multer = require('multer');
const path = require('path');
const InventoryLog = require('../models/InventoryLog');
const Product = require('../models/Product');

// Configure Multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Images will be stored in the 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    }
});

const upload = multer({ storage: storage });


// Get all products
router.get('/', async (req, res) => {
    const { q, _page, _limit, _sort, _order } = req.query;
    let query = 'SELECT * FROM products';
    let countQuery = 'SELECT COUNT(*) as total FROM products';
    let queryParams = [];
    let countQueryParams = [];

    // Filtering
    if (q) {
        query += ' WHERE name LIKE ? OR master_sku LIKE ?';
        countQuery += ' WHERE name LIKE ? OR master_sku LIKE ?';
        queryParams.push(`%${q}%`, `%${q}%`);
        countQueryParams.push(`%${q}%`, `%${q}%`);
    }

    // Sorting
    if (_sort && _order) {
        query += ` ORDER BY ${_sort} ${_order.toUpperCase()}`;
    }

    // Pagination
    const page = parseInt(_page) || 1;
    const limit = parseInt(_limit) || 10;
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(limit, offset);

    try {
        const [products] = await pool.query(query, queryParams);
        const [totalResult] = await pool.query(countQuery, countQueryParams);
        const totalItems = totalResult[0].total;

        res.json({
            products,
            total: totalItems,
            page: page,
            limit: limit
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get product by SKU for validation
router.get('/validate-sku/:master_sku', async (req, res) => {
    const { master_sku } = req.params;
    try {
        const [rows] = await pool.query('SELECT id FROM products WHERE master_sku = ?', [master_sku]);
        if (rows.length > 0) {
            res.json({ exists: true });
        } else {
            res.json({ exists: false });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new product
router.post('/', upload.single('image'), async (req, res) => {
    const { master_sku, name, price, quantity } = req.body;
    const is_banned_numeric = req.body.is_banned === '1' ? 1 : 0; // Convert string '1' to 1, otherwise 0 for DB
    const is_banned_boolean = req.body.is_banned === '1'; // Convert to boolean for response
    const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Get image_url from uploaded file
    try {
        const [result] = await pool.query(
            'INSERT INTO products (master_sku, name, price, quantity, is_banned, image_url) VALUES (?, ?, ?, ?, ?, ?)',
            [master_sku, name, price, quantity, is_banned_numeric, image_url]
        );
        // Log initial product quantity as an inbound change
        if (quantity > 0) {
            await InventoryLog.create('inbound', quantity, result.insertId);
        }
        res.status(201).json({ id: result.insertId, master_sku, name, price, quantity, is_banned: is_banned_boolean, image_url });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a product
router.put('/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const { master_sku, name, price, quantity } = req.body;
    const is_banned = req.body.is_banned === '1' ? 1 : 0; // Convert string '1' to 1, otherwise 0
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url; // Get image_url from uploaded file or use existing one
    try {
        // Get current product quantity before update
        const oldProduct = await Product.findById(id);
        if (!oldProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const [result] = await pool.query(
            'UPDATE products SET master_sku = ?, name = ?, price = ?, quantity = ?, is_banned = ?, image_url = ? WHERE id = ?',
            [master_sku, name, price, quantity, is_banned, image_url, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Log inventory change if quantity has changed
        const oldQuantity = oldProduct.quantity;
        const newQuantity = parseInt(quantity);
        if (newQuantity !== oldQuantity) {
            const change = newQuantity - oldQuantity;
            const changeType = change > 0 ? 'inbound' : 'adjustment'; // Or 'outbound' if negative and due to other reasons
            await InventoryLog.create(changeType, Math.abs(change), id);
        }

        res.json({ message: 'Product updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a product
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM products WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;