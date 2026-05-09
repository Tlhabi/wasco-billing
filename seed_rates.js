const mysql = require('mysql2');

const cloudConfig = {
    host: 'bjbbx5quifwdulzjklky-mysql.services.clever-cloud.com',
    user: 'uc0218pjkdfymjtr',
    password: 'H12uhHsh2Nz5qMxgeWTw',
    database: 'bjbbx5quifwdulzjklky'
};

const connection = mysql.createConnection(cloudConfig);

const rates = [
  { tier_name: 'Residential', minimum_units: 0, maximum_units: 999999, rate_per_unit: 5.50 },
  { tier_name: 'Business', minimum_units: 0, maximum_units: 999999, rate_per_unit: 7.00 },
  { tier_name: 'Industrial', minimum_units: 0, maximum_units: 999999, rate_per_unit: 9.00 }
];

console.log('🚀 Seeding billing rates...');

connection.connect(err => {
    if (err) {
        console.error('❌ Connection failed:', err.message);
        return;
    }
    console.log('✅ Connected to Cloud MySQL.');

    // First check if rates already exist
    connection.query('SELECT COUNT(*) as count FROM billing_rates', (err, results) => {
        if (err) {
            console.error('❌ Error checking rates:', err.message);
            connection.end();
            return;
        }
        
        if (results[0].count > 0) {
            console.log('✅ Billing rates already seeded.');
            connection.end();
            return;
        }

        let completed = 0;
        rates.forEach(rate => {
            connection.query(
                'INSERT INTO billing_rates (tier_name, minimum_units, maximum_units, rate_per_unit) VALUES (?, ?, ?, ?)',
                [rate.tier_name, rate.minimum_units, rate.maximum_units, rate.rate_per_unit],
                (err) => {
                    if (err) console.error('❌ Error inserting rate:', err.message);
                    completed++;
                    if (completed === rates.length) {
                        console.log('🎉 Seed complete! Billing rates inserted.');
                        connection.end();
                    }
                }
            );
        });
    });
});
