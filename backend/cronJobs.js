const cron = require('node-cron');
const { pool } = require('./db');
const logger = require('./logger');

const LOW_STOCK_THRESHOLD = 10; // Define your low stock threshold

async function checkLowStock() {
    try {
        const [rows] = await pool.query(
            'SELECT id, name, master_sku, quantity FROM products WHERE quantity <= ?',
            [LOW_STOCK_THRESHOLD]
        );

        if (rows.length > 0) {
            logger.warn('Low stock alert!');
            rows.forEach(product => {
                logger.warn(`Product: ${product.name} (SKU: ${product.master_sku}) has ${product.quantity} units left.`);
                // TODO: Integrate Nodemailer here for email alerts if enabled
            });
        } else {
            logger.info('No low stock products found.');
        }
    } catch (error) {
        logger.error('Error checking low stock:', error);
    }
}

function startCronJobs() {
    // Schedule to run every hour
    cron.schedule('0 * * * *', () => {
        logger.info('Running low stock check...');
        checkLowStock();
    });
    logger.info('Low stock cron job scheduled.');
}

module.exports = { startCronJobs };
