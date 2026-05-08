const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

const sqlitePath = process.env.SQLITE_PATH || 'C:\\\\Users\\\\Lenovo\\\\Desktop\\\\wasco_usage.sqlite.db';
const lite = new sqlite3.Database(sqlitePath);

db.query('SELECT account_number FROM customers', (err, customerRows) => {
  if (err) { console.error(err); process.exit(1); }
  const customerAccounts = customerRows.map(r => r.account_number);

  lite.all('SELECT DISTINCT account_number FROM water_usage', [], (err, usageRows) => {
    if (err) { console.error(err); process.exit(1); }
    const usageAccounts = usageRows.map(r => r.account_number);

    console.log('Usage Accounts:', usageAccounts);
    console.log('Customer Accounts:', customerAccounts);

    const missing = usageAccounts.filter(acc => !customerAccounts.includes(acc));
    console.log('--- ACCOUNTS IN USAGE BUT MISSING IN CUSTOMERS ---');
    console.log(missing);

    db.end();
    lite.close();
  });
});
