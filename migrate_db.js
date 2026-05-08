require('dotenv').config();
const mysql = require('mysql2');

// PASTE YOUR CLEVER CLOUD CREDENTIALS HERE
const cloudConfig = {
    host: 'bjbbx5quifwdulzjklky-mysql.services.clever-cloud.com',
    user: 'uc0218pjkdfymjtr',
    password: 'H12uhHsh2Nz5qMxgeWTw',
    database: 'bjbbx5quifwdulzjklky'
};

const connection = mysql.createConnection(cloudConfig);

const schema = [
    `CREATE TABLE IF NOT EXISTS customers (
        account_number VARCHAR(20) PRIMARY KEY,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        email VARCHAR(100),
        address TEXT,
        district VARCHAR(50),
        phone_number VARCHAR(20),
        customer_type VARCHAR(20) DEFAULT 'Residential'
    )`,
    `CREATE TABLE IF NOT EXISTS user_accounts (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('Admin', 'Manager', 'Customer') NOT NULL,
        account_number VARCHAR(20),
        created_date DATE,
        FOREIGN KEY (account_number) REFERENCES customers(account_number)
    )`,
    `CREATE TABLE IF NOT EXISTS billing_rates (
        rate_id INT AUTO_INCREMENT PRIMARY KEY,
        tier_name VARCHAR(50),
        minimum_units INT,
        maximum_units INT,
        rate_per_unit DECIMAL(10,2)
    )`,
    `CREATE TABLE IF NOT EXISTS bills (
        bill_id INT AUTO_INCREMENT PRIMARY KEY,
        account_number VARCHAR(20),
        billing_month VARCHAR(20),
        units_used INT,
        total_amount DECIMAL(10,2),
        due_date DATE,
        payment_status ENUM('Paid', 'Unpaid') DEFAULT 'Unpaid',
        payment_date DATE,
        FOREIGN KEY (account_number) REFERENCES customers(account_number)
    )`,
    `CREATE TABLE IF NOT EXISTS leakage_reports (
        report_id INT AUTO_INCREMENT PRIMARY KEY,
        account_number VARCHAR(20),
        report_date DATE,
        location TEXT,
        description TEXT,
        status ENUM('Pending', 'In Progress', 'Fixed') DEFAULT 'Pending',
        repair_date DATE,
        FOREIGN KEY (account_number) REFERENCES customers(account_number)
    )`
];

console.log('🚀 Starting migration to Cloud MySQL...');

connection.connect(err => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to Cloud MySQL.');

    let completed = 0;
    schema.forEach(query => {
        connection.query(query, (err) => {
            if (err) console.error('❌ Error creating table:', err.message);
            completed++;
            if (completed === schema.length) {
                console.log('🎉 Migration complete! All tables created.');
                connection.end();
            }
        });
    });
});
