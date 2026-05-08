// calculateBills.js (CORRECTED PATH)
// Run this to calculate bills for all customers

const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();

// ========== CONNECT TO MySQL ==========
const mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',        // Your MySQL username
    password: '',        // Your MySQL password
    database: 'wasco_billing'
});

// ========== CONNECT TO SQLite (CORRECTED PATH) ==========
const sqlitePath = 'C:\\\\Users\\\\Lenovo\\\\Desktop\\\\wasco_usage.sqlite.db';
const sqliteConnection = new sqlite3.Database(sqlitePath);

// ========== BILL CALCULATION FUNCTION ==========
function calculateBill(unitsUsed, rates) {
    let total = 0;

    for (const tier of rates) {
        if (unitsUsed > tier.maximum_units) {
            // Full tier
            const unitsInTier = tier.maximum_units - tier.minimum_units + 1;
            total += unitsInTier * tier.rate_per_unit;
        }
        else if (unitsUsed >= tier.minimum_units) {
            // Partial tier (last one)
            const unitsInTier = unitsUsed - tier.minimum_units + 1;
            total += unitsInTier * tier.rate_per_unit;
            break;
        }
    }

    return total;
}

// ========== MAIN FUNCTION ==========
function calculateAndInsertBills() {
    console.log('🚰 WASCO Bill Calculation Started\n');

    // Step 1: Get billing rates from MySQL
    mysqlConnection.query('SELECT * FROM billing_rates ORDER BY minimum_units', (err, rates) => {
        if (err) {
            console.error('❌ MySQL Error:', err);
            return;
        }
        console.log(`✓ Loaded ${rates.length} billing rates from MySQL`);

        // Display rates for verification
        console.log('\n📊 Billing Rates:');
        rates.forEach(rate => {
            console.log(`   ${rate.tier_name}: ${rate.minimum_units}-${rate.maximum_units} units @ LSL ${rate.rate_per_unit}`);
        });
        console.log('');

        // Step 2: Get water usage from SQLite
        sqliteConnection.all('SELECT * FROM water_usage', (err, usageRecords) => {
            if (err) {
                console.error('❌ SQLite Error:', err);
                return;
            }
            console.log(`✓ Loaded ${usageRecords.length} usage records from SQLite\n`);

            // Step 3: Calculate bill for each customer
            usageRecords.forEach(record => {
                const units = record.units_used;
                const amount = calculateBill(units, rates);

                console.log(`📄 ${record.account_number}: ${units} units = LSL ${amount.toFixed(2)}`);

                // Step 4: Insert or update bill in MySQL
                const checkSql = 'SELECT * FROM bills WHERE account_number = ? AND billing_month = ?';
                mysqlConnection.query(checkSql, [record.account_number, record.billing_month], (err, results) => {
                    if (err) {
                        console.error(`❌ Error checking bill for ${record.account_number}:`, err);
                        return;
                    }

                    if (results.length > 0) {
                        // Update existing
                        const updateSql = 'UPDATE bills SET units_used = ?, total_amount = ? WHERE account_number = ? AND billing_month = ?';
                        mysqlConnection.query(updateSql, [units, amount, record.account_number, record.billing_month]);
                        console.log(`   → Updated existing bill`);
                    } else {
                        // Insert new
                        const insertSql = 'INSERT INTO bills (account_number, billing_month, units_used, total_amount, due_date, payment_status) VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 15 DAY), "Unpaid")';
                        mysqlConnection.query(insertSql, [record.account_number, record.billing_month, units, amount]);
                        console.log(`   → New bill inserted`);
                    }
                });
            });

            // Wait 1.5 seconds then close connections
            setTimeout(() => {
                console.log('\n✅ Bill calculation complete!');
                mysqlConnection.end();
                sqliteConnection.close();
            }, 1500);
        });
    });
}

// Run the script
calculateAndInsertBills();