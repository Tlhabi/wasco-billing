const mysql = require('mysql2');
const conn = mysql.createConnection({host:'localhost', user:'root', password:'12345678', database:'wasco_billing'});
conn.query('SELECT * FROM leakage_reports', (err, res) => {
  if (err) console.error(err);
  else console.log(JSON.stringify(res));
  conn.end();
});
