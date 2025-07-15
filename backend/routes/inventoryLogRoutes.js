const express = require('express');
const router = express.Router();
const InventoryLog = require('../models/InventoryLog');

// Get all inventory logs
router.get('/', async (req, res) => {
    try {
        const logs = await InventoryLog.findAll();
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
