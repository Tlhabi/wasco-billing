const mysql = require('mysql2');

const cloudConfig = {
    host: 'bjbbx5quifwdulzjklky-mysql.services.clever-cloud.com',
    user: 'uc0218pjkdfymjtr',
    password: 'H12uhHsh2Nz5qMxgeWTw',
    database: 'bjbbx5quifwdulzjklky'
};

const connection = mysql.createConnection(cloudConfig);

const queries = [
    'DROP TABLE IF EXISTS notifications',
    `CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        account_number VARCHAR(20),
        type VARCHAR(50),
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX (account_number)
    )`
];

connection.connect(err => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        return;
    }
    
    connection.query(queries[0], (err) => {
        if (err) console.error('❌ Error dropping table:', err.message);
        connection.query(queries[1], (err) => {
            if (err) console.error('❌ Error creating table:', err.message);
            else console.log('🎉 Notifications table recreated with account_number column!');
            connection.end();
        });
    });
});
