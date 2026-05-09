const mysql = require('mysql2');
require('dotenv').config({path: './backend/.env'});
const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});
conn.query('SELECT * FROM billing_rates', (err, res) => {
  console.log(err || res);
  conn.end();
});
