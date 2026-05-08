const mysql = require('mysql2');

const passwords = ['', 'root', 'password', '123456', 'admin'];
let i = 0;

function tryNext() {
    if (i >= passwords.length) {
        console.log("All failed.");
        process.exit(1);
    }
    const p = passwords[i];
    console.log(`Trying password: '${p}'`);
    const conn = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: p,
        database: 'wasco_billing'
    });
    
    conn.connect(err => {
        if (err) {
            console.log(`Failed with '${p}'`);
            i++;
            tryNext();
        } else {
            console.log(`SUCCESS with '${p}'`);
            conn.end();
            process.exit(0);
        }
    });
}

tryNext();
