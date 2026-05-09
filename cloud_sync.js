const mysql = require('mysql2/promise');

// 1. LOCAL DATABASE CONFIG
const localConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678', // Update if different
    database: 'wasco_billing'
};

// 2. CLOUD DATABASE CONFIG (Clever Cloud)
const cloudConfig = {
    host: 'bjbbx5quifwdulzjklky-mysql.services.clever-cloud.com',
    user: 'uc0218pjkdfymjtr',
    password: 'H12uhHsh2Nz5qMxgeWTw',
    database: 'bjbbx5quifwdulzjklky'
};

async function sync() {
    try {
        const localConn = await mysql.createConnection(localConfig);
        const cloudConn = await mysql.createConnection(cloudConfig);

        console.log('🔄 Fetching local customers...');
        const [customers] = await localConn.query('SELECT * FROM customers');
        
        console.log('🔄 Fetching local bills...');
        const [bills] = await localConn.query('SELECT * FROM bills');

        console.log(`📤 Uploading ${customers.length} customers to cloud...`);
        for (const c of customers) {
            await cloudConn.query(
                'INSERT IGNORE INTO customers (account_number, first_name, last_name, email, address, district, phone_number, customer_type) VALUES (?,?,?,?,?,?,?,?)',
                [c.account_number, c.first_name, c.last_name, c.email, c.address, c.district, c.phone_number, c.customer_type]
            );
        }

        console.log(`📤 Uploading ${bills.length} bills to cloud...`);
        for (const b of bills) {
            await cloudConn.query(
                'INSERT IGNORE INTO bills (account_number, billing_month, units_used, total_amount, due_date, payment_status, payment_date) VALUES (?,?,?,?,?,?,?)',
                [b.account_number, b.billing_month, b.units_used, b.total_amount, b.due_date, b.payment_status, b.payment_date]
            );
        }

        console.log('🎉 SYNC COMPLETE! Refresh your website now.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err.message);
        process.exit(1);
    }
}

sync();
