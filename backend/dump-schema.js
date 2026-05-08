const mysql = require('mysql2/promise');
async function dump() {
    const connection = await mysql.createConnection({ host: 'localhost', user: 'root', password: '12345678', database: 'wasco_billing' });
    const [tables] = await connection.query('SHOW TABLES');
    for (let row of tables) {
        const tableName = Object.values(row)[0];
        const [create] = await connection.query(`SHOW CREATE TABLE ${tableName}`);
        console.log(create[0]['Create Table']);
    }
    await connection.end();
}
dump().catch(console.error);
