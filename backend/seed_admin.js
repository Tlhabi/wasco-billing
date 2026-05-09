const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const cloudConfig = {
    host: 'bjbbx5quifwdulzjklky-mysql.services.clever-cloud.com',
    user: 'uc0218pjkdfymjtr',
    password: 'H12uhHsh2Nz5qMxgeWTw',
    database: 'bjbbx5quifwdulzjklky'
};

async function seedUsers() {
    const connection = mysql.createConnection(cloudConfig);
    
    const adminHash = await bcrypt.hash('admin123', 10);
    const managerHash = await bcrypt.hash('manager123', 10);

    connection.query(
        'INSERT IGNORE INTO user_accounts (username, password_hash, role) VALUES (?, ?, ?), (?, ?, ?)',
        ['admin', adminHash, 'Admin', 'manager', managerHash, 'Manager'],
        (err, results) => {
            if (err) console.error('❌ Error seeding users:', err.message);
            else console.log('🎉 Admin and Manager users seeded successfully!');
            connection.end();
        }
    );
}

seedUsers();
