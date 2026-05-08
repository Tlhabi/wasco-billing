const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'wasco_billing'
});

connection.connect((err) => {
    if (err) {
        console.error('Connection error:', err);
        return;
    }
    console.log('Connected!');
    
    connection.query('SHOW COLUMNS FROM customers', (err, results) => {
        if (err) {
            console.error('Query error:', err);
        } else {
            console.log('Columns in customers table:');
            console.table(results);
        }
        connection.end();
    });
});
