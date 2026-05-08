const mysql = require('mysql2');
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'wasco_billing'
});
conn.query('DESCRIBE user_accounts', (err, res) => {
    if (err) console.error(err);
    else console.log(res);
    conn.end();
});
