const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function initializeDatabase() {
    try {
        const connection = await pool.getConnection();

        // Create roles table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(50) UNIQUE NOT NULL,
                permissions JSON
            )
        `);

        // Insert default roles if they don't exist
        await connection.query(`
            INSERT IGNORE INTO roles (id, name) VALUES (1, 'user');
        `);
        await connection.query(`
            INSERT IGNORE INTO roles (id, name) VALUES (2, 'admin');
        `);

        // Create users table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role_id INT NOT NULL,
                FOREIGN KEY (role_id) REFERENCES roles(id)
            )
        `);

        // Create products table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                master_sku VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                quantity INT NOT NULL,
                is_banned BOOLEAN DEFAULT FALSE,
                image_url VARCHAR(255)
            )
        `);

        // Create orders table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_number VARCHAR(255) UNIQUE NOT NULL,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                status VARCHAR(50) NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        // Create inventory_logs table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS inventory_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                change_type VARCHAR(50) NOT NULL,
                quantity INT NOT NULL,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products(id)
            )
        `);

        console.log('Database tables created or already exist.');
        connection.release();
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

module.exports = { pool, initializeDatabase };