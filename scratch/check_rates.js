const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: 'bjbbx5quifwdulzjklky-mysql.services.clever-cloud.com',
  user: 'uc0218pjkdfymjtr',
  password: 'H12uhHsh2Nz5qMxgeWTw',
  database: 'bjbbx5quifwdulzjklky'
});
conn.query('SELECT * FROM billing_rates', (err, res) => {
  console.log(err || res);
  conn.end();
});
