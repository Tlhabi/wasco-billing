const mysql = require('mysql2');

const cloudConfig = {
    host: 'bjbbx5quifwdulzjklky-mysql.services.clever-cloud.com',
    user: 'uc0218pjkdfymjtr',
    password: 'H12uhHsh2Nz5qMxgeWTw',
    database: 'bjbbx5quifwdulzjklky'
};

const connection = mysql.createConnection(cloudConfig);

const query = `
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50),
    message TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

connection.connect(err => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        return;
    }
    connection.query(query, (err) => {
        if (err) console.error('❌ Error creating notifications table:', err.message);
        else console.log('🎉 Notifications table created successfully!');
        connection.end();
    });
});
