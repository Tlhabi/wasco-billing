const mysql = require('mysql2/promise');

const localConfig = {
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'wasco_billing'
};

const cloudConfig = {
    host: 'bjbbx5quifwdulzjklky-mysql.services.clever-cloud.com',
    user: 'uc0218pjkdfymjtr',
    password: 'H12uhHsh2Nz5qMxgeWTw',
    database: 'bjbbx5quifwdulzjklky'
};

async function syncRest() {
    try {
        const localConn = await mysql.createConnection(localConfig);
        const cloudConn = await mysql.createConnection(cloudConfig);

        console.log('🔄 Fetching local user_accounts...');
        const [users] = await localConn.query('SELECT * FROM user_accounts');
        
        console.log('🔄 Fetching local leakage_reports...');
        const [leakages] = await localConn.query('SELECT * FROM leakage_reports');

        console.log(`📤 Uploading ${users.length} user_accounts to cloud...`);
        for (const u of users) {
            await cloudConn.query(
                'INSERT IGNORE INTO user_accounts (user_id, username, password_hash, role, account_number, created_date) VALUES (?,?,?,?,?,?)',
                [u.user_id, u.username, u.password_hash, u.role, u.account_number, u.created_date]
            );
        }

        console.log(`📤 Uploading ${leakages.length} leakage_reports to cloud...`);
        for (const l of leakages) {
            await cloudConn.query(
                'INSERT IGNORE INTO leakage_reports (report_id, account_number, report_date, location, description, status, repair_date) VALUES (?,?,?,?,?,?,?)',
                [l.report_id, l.account_number, l.report_date, l.location, l.description, l.status, l.repair_date]
            );
        }

        console.log('🎉 Missing data synced! You can now log in as malefu.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Sync failed:', err.message);
        process.exit(1);
    }
}

syncRest();
