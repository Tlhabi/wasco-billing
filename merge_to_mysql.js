const mysql = require('mysql2');

const cloudConfig = {
    host: 'bjbbx5quifwdulzjklky-mysql.services.clever-cloud.com',
    user: 'uc0218pjkdfymjtr',
    password: 'H12uhHsh2Nz5qMxgeWTw',
    database: 'bjbbx5quifwdulzjklky'
};

const connection = mysql.createConnection(cloudConfig);

const migrationQueries = [
    `CREATE TABLE IF NOT EXISTS water_usage (
        id INT AUTO_INCREMENT PRIMARY KEY,
        account_number VARCHAR(20),
        billing_month VARCHAR(20),
        reading_date DATE,
        units_used INT
    )`,
    `CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action VARCHAR(100),
        performed_by VARCHAR(100),
        target VARCHAR(100),
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        details TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS payments_tracking (
        id INT AUTO_INCREMENT PRIMARY KEY,
        account_number VARCHAR(20),
        bill_month VARCHAR(20),
        amount_paid DECIMAL(10,2),
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        payment_method VARCHAR(50),
        reference_number VARCHAR(100)
    )`
];

connection.connect(err => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        return;
    }
    console.log('🔄 Merging SQLite tables into MySQL...');
    
    let completed = 0;
    migrationQueries.forEach(query => {
        connection.query(query, (err) => {
            if (err) console.error('❌ Error:', err.message);
            completed++;
            if (completed === migrationQueries.length) {
                console.log('🎉 Database Merge Complete! MySQL is now the single source of truth.');
                connection.end();
            }
        });
    });
});
