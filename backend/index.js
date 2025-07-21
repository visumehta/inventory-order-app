const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
// const inventoryLogRoutes = require('./routes/inventoryLogRoutes');
// const errorHandler = require('./middleware/errorHandler');

const inventoryLogRoutes = require('./routes/inventoryLogRoutes');
const errorHandler = require('./middleware/errorHandler');

app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/inventory-logs', inventoryLogRoutes);

app.get('/', (req, res) => {
    res.send('Inventory & Order Listing API');
});

app.use(errorHandler);
// app.use('/api/inventory-logs', inventoryLogRoutes);

app.get('/', (req, res) => {
    res.send('Inventory & Order Listing API');
});

// app.use(errorHandler);

const { initializeDatabase } = require('./db');
const { startCronJobs } = require('./cronJobs');

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        startCronJobs(); // Start cron jobs after server is listening
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});



