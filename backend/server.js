require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const app = express();

// CORS configuration for Firebase
app.use(cors({
    origin: ['https://wasco-billing-fbf61.web.app', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

// Request logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url} [${res.statusCode}] - ${duration}ms`);
    });
    next();
});

// ========== CONNECT TO MySQL (Pool - auto-reconnects) ==========
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '12345678',
    database: process.env.DB_NAME || 'wasco_billing',
    waitForConnections: true,
    connectionLimit: 3, // Safe for Clever Cloud free tier
    queueLimit: 0
});

// Test pool connection on startup
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ MySQL connection error:', err.message);
    } else {
        console.log('✅ Connected to MySQL wasco_billing database (pool).');
        connection.release();
    }
});

// Helper: promisified pool query
const db = {
    query: (sql, params) => new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    }),
    execute: (sql, params) => new Promise((resolve, reject) => {
        pool.execute(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    })
};

// ========== BILL CALCULATION HELPER ==========
function calculateBill(unitsUsed, rates) {
    let total = 0;
    for (const tier of rates) {
        if (unitsUsed > tier.maximum_units) {
            const unitsInTier = tier.maximum_units - tier.minimum_units + 1;
            total += unitsInTier * tier.rate_per_unit;
        } else if (unitsUsed >= tier.minimum_units) {
            const unitsInTier = unitsUsed - tier.minimum_units + 1;
            total += unitsInTier * tier.rate_per_unit;
            break;
        }
    }
    return total;
}

// ========== CONNECT TO SQLite ==========
const sqlitePath = process.env.SQLITE_PATH || './wasco_usage.sqlite.db';
const sqliteConnection = new sqlite3.Database(sqlitePath, (err) => {
    if (err) console.error('SQLite connection error:', err);
    else console.log('✅ Connected to SQLite usage database.');
});

// Helper: promisified sqlite run/all
const lite = {
    run: (sql, params) => new Promise((resolve, reject) => {
        sqliteConnection.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    }),
    all: (sql, params) => new Promise((resolve, reject) => {
        sqliteConnection.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    })
};

// ========== ENSURE SQLite TABLES EXIST ==========
sqliteConnection.serialize(() => {
    sqliteConnection.run(`CREATE TABLE IF NOT EXISTS water_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_number TEXT NOT NULL,
        billing_month TEXT NOT NULL,
        reading_date DATE,
        units_used INTEGER NOT NULL
    )`);
    sqliteConnection.run(`CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_number TEXT NOT NULL,
        bill_month TEXT NOT NULL,
        amount_paid REAL NOT NULL,
        payment_date TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        reference_number TEXT NOT NULL
    )`);
    sqliteConnection.run(`CREATE TABLE IF NOT EXISTS notifications (
        notification_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_number TEXT NOT NULL,
        bill_month TEXT,
        notification_type TEXT NOT NULL,
        sent_date TEXT NOT NULL,
        sent_to TEXT,
        is_read INTEGER DEFAULT 0
    )`);
    sqliteConnection.run(`CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        action TEXT NOT NULL,
        performed_by TEXT NOT NULL,
        target TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        details TEXT
    )`);
    console.log('✅ SQLite tables verified/created.');
    
    // AUTO-SEED DEMO DATA FOR HETEROGENEOUS DB PRESENTATION
    sqliteConnection.get("SELECT COUNT(*) as count FROM water_usage", (err, row) => {
        if (!err && row && row.count === 0) {
            console.log('🌱 SQLite is empty. Seeding demo data for presentation...');
            const months = ['2026-01', '2026-02', '2026-03', '2026-04'];
            const accounts = ['WASCO-001', 'WASCO-002', 'WASCO-7301', 'WASCO-6389'];
            
            accounts.forEach(acc => {
                months.forEach(m => {
                    const usage = Math.floor(Math.random() * 50) + 10;
                    sqliteConnection.run(
                        "INSERT INTO water_usage (account_number, billing_month, reading_date, units_used) VALUES (?, ?, date('now'), ?)",
                        [acc, m, usage]
                    );
                });
            });
            console.log('✅ SQLite Demo Data seeded.');
        }
    });
});

// Helper: Log system actions
async function logAudit(action, performedBy, target, details) {
    try {
        await lite.run(
            'INSERT INTO audit_logs (action, performed_by, target, details) VALUES (?, ?, ?, ?)',
            [action, performedBy, target, details]
        );
    } catch (err) {
        console.error('Audit Log Error:', err.message);
    }
}

// --- API ENDPOINTS ---

app.get('/', (req, res) => {
    res.send('WASCO Billing Backend is running. Please use /api endpoints.');
});

// 0. Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const results = await db.query('SELECT * FROM user_accounts WHERE username = ?', [username]);
        if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash).catch(() => false);
        if (match || password === user.password_hash) {
            // Fetch full customer profile if this is a customer
            let profile = null;
            if (user.account_number) {
                const custResults = await db.query('SELECT * FROM customers WHERE account_number = ?', [user.account_number]);
                if (custResults.length > 0) {
                    const c = custResults[0];
                    profile = {
                        first_name: c.first_name,
                        last_name: c.last_name,
                        email: c.email,
                        phone: c.phone_number,
                        address: c.address,
                        district: c.district,
                        customer_type: c.customer_type
                    };
                }
            }
            console.log(`✅ Successful login: ${username}`);
            res.json({ 
                success: true, 
                user: { 
                    id: user.user_id, 
                    username: username,
                    role: user.role, 
                    account_number: user.account_number,
                    ...profile
                } 
            });
        } else {
            console.log(`❌ Failed login: ${username}`);
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. Get all bills from MySQL
app.get('/api/bills', async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM bills ORDER BY due_date DESC', []);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Get usage records from SQLite
app.get('/api/usage', async (req, res) => {
    try {
        const results = await lite.all('SELECT * FROM water_usage', []);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Mark a bill as paid & track payment in SQLite
app.post('/api/pay', async (req, res) => {
    const { account_number, billing_month, amount, payment_method } = req.body;
    try {
        await db.query(
            'UPDATE bills SET payment_status = "Paid", payment_date = CURDATE() WHERE account_number = ? AND billing_month = ?',
            [account_number, billing_month]
        );

        const refNumber = 'REF-' + Math.floor(Math.random() * 1000000);
        const payMethod = payment_method || 'Online';
        await lite.run(
            'INSERT INTO payments (account_number, bill_month, amount_paid, payment_date, payment_method, reference_number) VALUES (?, ?, ?, date("now"), ?, ?)',
            [account_number, billing_month, amount, payMethod, refNumber]
        );

        console.log(`✅ Payment successful for ${account_number}, Ref: ${refNumber}`);
        res.json({ success: true, message: 'Payment recorded successfully', reference: refNumber });
    } catch (err) {
        console.error('❌ Payment error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 4. Report Leakage (POST /api/leakage and /api/leakages both work)
async function handleLeakage(req, res) {
    const { account_number, location, description } = req.body;
    try {
        const results = await db.query(
            'INSERT INTO leakage_reports (account_number, report_date, location, description, status) VALUES (?, CURDATE(), ?, ?, "Pending")',
            [account_number, location, description]
        );
        res.json({ success: true, message: 'Leakage reported successfully', report_id: results.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
app.post('/api/leakage', handleLeakage);
app.post('/api/leakages', handleLeakage);

// 5. Manual Meter Reading — records usage, auto-generates bill, AND notifies customer
app.post('/api/usage', async (req, res) => {
    const { account_number, billing_month, reading_date, units_used } = req.body;
    try {
        // 1. Insert usage record into SQLite
        await lite.run(
            'INSERT INTO water_usage (account_number, billing_month, reading_date, units_used) VALUES (?, ?, ?, ?)',
            [account_number, billing_month, reading_date, units_used]
        );

        // 2. Auto-calculate bill from billing rates
        const rates = await db.query('SELECT * FROM billing_rates ORDER BY minimum_units ASC', []);
        const totalAmount = calculateBill(parseInt(units_used), rates);

        // 3. Insert bill into MySQL (so it appears in customer's billing history)
        await db.query(
            'INSERT INTO bills (account_number, billing_month, units_used, total_amount, due_date, payment_status) VALUES (?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 14 DAY), "Unpaid")',
            [account_number, billing_month, units_used, totalAmount]
        );

        // 4. Create a rich notification so the customer sees it immediately
        const sentDate = new Date().toISOString().split('T')[0];
        await lite.run(
            'INSERT INTO notifications (account_number, bill_month, notification_type, sent_date, sent_to, is_read) VALUES (?, ?, ?, ?, ?, 0)',
            [account_number, billing_month, `Bill Generated - LSL ${totalAmount.toFixed(2)}`, sentDate, 'Customer Portal']
        );

        console.log(`✅ Usage recorded, bill generated (LSL ${totalAmount.toFixed(2)}), & customer notified: ${account_number} (${billing_month})`);
        res.json({ success: true, message: `Usage recorded. Bill of LSL ${totalAmount.toFixed(2)} generated and customer notified.` });
    } catch (err) {
        console.error('❌ Usage recording error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 5a. Get Usage Reports
app.get('/api/reports/usage', async (req, res) => {
    try {
        const results = await lite.all(
            'SELECT reading_date, billing_month, units_used FROM water_usage ORDER BY reading_date ASC',
            []
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5b. Get Segmented Usage
app.get('/api/reports/segments', async (req, res) => {
    try {
        const customers = await db.query('SELECT account_number, customer_type FROM customers', []);
        const usageRecords = await lite.all('SELECT account_number, units_used FROM water_usage', []);

        const segments = {};
        usageRecords.forEach(record => {
            const customer = customers.find(c => c.account_number === record.account_number);
            const type = customer ? customer.customer_type : 'Unknown';
            segments[type] = (segments[type] || 0) + record.units_used;
        });

        const response = Object.keys(segments).map(key => ({ segment: key, total_units: segments[key] }));
        res.json(response);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Get Leakage Reports
app.get('/api/leakages', async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM leakage_reports ORDER BY report_date DESC', []);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Get Customers
app.get('/api/customers', async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM customers', []);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7b. Get Billing Rates
app.get('/api/rates', async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM billing_rates ORDER BY minimum_units', []);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Add Billing Rate
app.post('/api/rates', async (req, res) => {
    const { tier_name, minimum_units, maximum_units, rate_per_unit } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO billing_rates (tier_name, minimum_units, maximum_units, rate_per_unit) VALUES (?, ?, ?, ?)',
            [tier_name, minimum_units, maximum_units, rate_per_unit]
        );
        res.json({ success: true, rate_id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8b. Update Billing Rate
app.put('/api/rates/:id', async (req, res) => {
    const { tier_name, minimum_units, maximum_units, rate_per_unit } = req.body;
    const { id } = req.params;
    try {
        await db.query(
            'UPDATE billing_rates SET tier_name = ?, minimum_units = ?, maximum_units = ?, rate_per_unit = ? WHERE rate_id = ?',
            [tier_name, minimum_units, maximum_units, rate_per_unit, id]
        );
        res.json({ success: true, message: 'Rate tier updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8c. Delete Billing Rate
app.delete('/api/rates/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM billing_rates WHERE rate_id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. Add Customer (creates customer + user_account in transaction)
app.post('/api/customers', async (req, res) => {
    const { username, password, first_name, last_name, email, address, district, phone, customer_type } = req.body;
    const accNumber = `WASCO-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
        const hash = await bcrypt.hash(password, 10);

        await db.query(
            'INSERT INTO customers (account_number, first_name, last_name, email, address, district, phone_number, customer_type) VALUES (?,?,?,?,?,?,?,?)',
            [accNumber, first_name, last_name, email || '', address, district || '', phone || '', customer_type || 'Residential']
        );

        try {
            await db.query(
                'INSERT INTO user_accounts (username, password_hash, role, account_number, created_date) VALUES (?,?,?,?, CURDATE())',
                [username, hash, 'Customer', accNumber]
            );
        } catch (userErr) {
            // Roll back customer if user_account insert fails
            await db.query('DELETE FROM customers WHERE account_number = ?', [accNumber]);
            return res.status(500).json({ error: `Username already taken or invalid: ${userErr.message}` });
        }

        console.log(`✅ Customer created: ${accNumber} (${first_name} ${last_name})`);
        res.json({ success: true, account_number: accNumber });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9b. Update Customer
app.put('/api/customers/:account', async (req, res) => {
    const { first_name, last_name, email, address, district, phone, customer_type } = req.body;
    try {
        await db.query(
            'UPDATE customers SET first_name=?, last_name=?, email=?, address=?, district=?, phone_number=?, customer_type=? WHERE account_number=?',
            [first_name, last_name, email || '', address, district || '', phone || '', customer_type, req.params.account]
        );
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9c. Delete Customer — cascades to user_accounts, bills, leakages, notifications (MySQL + SQLite)
app.delete('/api/customers/:account', async (req, res) => {
    const { account } = req.params;
    try {
        // 1. Delete from MySQL dependent tables first (FK constraints)
        await db.query('DELETE FROM user_accounts WHERE account_number = ?', [account]);
        await db.query('DELETE FROM notifications WHERE account_number = ?', [account]);
        await db.query('DELETE FROM bills WHERE account_number = ?', [account]);
        await db.query('DELETE FROM leakage_reports WHERE account_number = ?', [account]);
        // 2. Delete the customer record itself
        const result = await db.query('DELETE FROM customers WHERE account_number = ?', [account]);

        // 3. Clean up SQLite data for this customer too
        await lite.run('DELETE FROM water_usage WHERE account_number = ?', [account]);
        await lite.run('DELETE FROM payments WHERE account_number = ?', [account]);
        await lite.run('DELETE FROM notifications WHERE account_number = ?', [account]);

        console.log(`✅ Customer fully deleted (MySQL + SQLite): ${account}`);
        res.json({ success: true, message: `Customer ${account} deleted.` });
    } catch (err) {
        console.error('❌ Delete customer error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 10. Get Payments
app.get('/api/payments', async (req, res) => {
    const account = req.query.account;
    try {
        let results;
        if (account) {
            results = await lite.all('SELECT * FROM payments WHERE account_number = ? ORDER BY payment_date DESC', [account]);
        } else {
            results = await lite.all('SELECT * FROM payments ORDER BY payment_date DESC', []);
        }
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 11. Register new customer (self-registration)
app.post('/api/register', async (req, res) => {
    // Accept both naming conventions for compatibility
    const username     = req.body.username;
    const password     = req.body.password;
    const first_name   = req.body.first_name   || req.body.firstName;
    const last_name    = req.body.last_name    || req.body.lastName;
    const email        = req.body.email        || '';
    const address      = req.body.address      || '';
    const district     = req.body.district     || '';
    const phone        = req.body.phone        || '';
    const customer_type = req.body.customer_type || 'Residential';

    console.log(`Registration attempt: ${username} (${first_name} ${last_name})`);

    if (!username || !password || !first_name || !last_name || !address) {
        return res.status(400).json({ error: 'Missing required fields (username, password, first name, last name, address)' });
    }

    try {
        const existing = await db.query('SELECT user_id FROM user_accounts WHERE username = ?', [username]);
        if (existing.length > 0) return res.status(409).json({ error: 'Username already taken' });

        const hash = await bcrypt.hash(password, 10);
        const accNumber = 'WASCO-' + Math.floor(1000 + Math.random() * 9000);

        await db.query(
            'INSERT INTO customers (account_number, first_name, last_name, address, district, customer_type, email, phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [accNumber, first_name, last_name, address, district, customer_type, email, phone]
        );
        await db.query(
            'INSERT INTO user_accounts (username, password_hash, role, account_number, created_date) VALUES (?, ?, ?, ?, CURDATE())',
            [username, hash, 'Customer', accNumber]
        );

        console.log(`✅ Registered: ${username} -> ${accNumber} (${customer_type})`);
        res.json({ success: true, message: 'Registration successful. You can now log in.' });
    } catch (err) {
        console.error('Registration error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 12. Calculate Bills for all customers (Bulk Action)
app.post('/api/calculate-bills', async (req, res) => {
    const { month } = req.body;
    if (!month) return res.status(400).json({ error: 'Billing month is required.' });

    try {
        const usageRecords = await lite.all('SELECT * FROM water_usage WHERE billing_month = ?', [month]);
        if (usageRecords.length === 0) {
            return res.json({ success: true, message: `No usage data found for ${month}.`, processed: 0 });
        }

        const rates = await db.query('SELECT * FROM billing_rates ORDER BY minimum_units', []);
        const sentDate = new Date().toISOString().split('T')[0];

        let processed = 0;
        let skipped = 0;
        let errors = [];

        for (const record of usageRecords) {
            try {
                // Verify customer exists in MySQL to avoid FK failure
                const customer = await db.query('SELECT account_number FROM customers WHERE account_number = ?', [record.account_number]);
                if (customer.length === 0) {
                    console.warn(`⚠️ Skipping bill for ${record.account_number}: Customer not found in MySQL.`);
                    skipped++;
                    continue;
                }

                const amount = calculateBill(record.units_used, rates);
                
                await db.query(
                    'INSERT INTO bills (account_number, billing_month, units_used, total_amount, due_date, payment_status) VALUES (?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 14 DAY), "Unpaid")',
                    [record.account_number, month, record.units_used, amount]
                );

                await lite.run(
                    'INSERT INTO notifications (account_number, bill_month, notification_type, sent_date, sent_to, is_read) VALUES (?, ?, ?, ?, ?, 0)',
                    [record.account_number, month, 'Bill Generated', sentDate, 'Customer Portal']
                );
                processed++;
            } catch (err) {
                console.error(`❌ Error processing bill for ${record.account_number}:`, err.message);
                errors.push({ account: record.account_number, error: err.message });
            }
        }

        await logAudit('Batch Billing', 'Manager', month, `Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors.length}`);
        
        res.json({ 
            success: true, 
            message: `Billing completed for ${month}.`,
            details: { processed, skipped, errors: errors.length > 0 ? errors : null }
        });
    } catch (err) {
        console.error('Critical billing error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// 13. Update Leakage Status
app.put('/api/leakages/:id', async (req, res) => {
    const { status } = req.body;
    const { id } = req.params;
    const repairDate = status === 'Fixed' ? new Date() : null;
    try {
        await db.query(
            'UPDATE leakage_reports SET status = ?, repair_date = ? WHERE report_id = ?',
            [status, repairDate, id]
        );
        await logAudit('Leakage Status Update', 'Manager', `Report #${id}`, `Changed status to ${status}`);
        res.json({ success: true, message: 'Status updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- ADVANCED SQL ENDPOINTS (USING VIEWS) ---

// 15. Get Outstanding Balances (Uses view_customer_balances)
app.get('/api/views/balances', async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM view_customer_balances WHERE total_outstanding > 0', []);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 16. Get Leakage Summary Stats (Uses view_leakage_summary)
app.get('/api/views/leakage-stats', async (req, res) => {
    try {
        const results = await db.query('SELECT * FROM view_leakage_summary', []);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- NOTIFICATIONS ENDPOINTS ---

app.get('/api/notifications', async (req, res) => {
    const { account } = req.query;
    if (!account) return res.status(400).json({ error: 'Account number required' });
    try {
        const results = await lite.all(
            'SELECT * FROM notifications WHERE account_number = ? ORDER BY sent_date DESC LIMIT 20',
            [account]
        );
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/notifications/:id/read', async (req, res) => {
    const { id } = req.params;
    try {
        await lite.run('UPDATE notifications SET is_read = 1 WHERE notification_id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 17. Broadcast Notification (Admin/Manager)
app.post('/api/notifications/broadcast', async (req, res) => {
    const { message, type } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    try {
        const users = await db.query('SELECT account_number FROM user_accounts WHERE role = "Customer"', []);
        const sentDate = new Date().toISOString().split('T')[0];
        
        for (const user of users) {
            if (user.account_number) {
                await lite.run(
                    'INSERT INTO notifications (account_number, notification_type, sent_date, sent_to, is_read) VALUES (?, ?, ?, ?, 0)',
                    [user.account_number, type || 'Broadcast Alert', sentDate, message]
                );
            }
        }
        
        await logAudit('Broadcast Sent', 'Administrator', 'All Customers', `Type: ${type}, Message: ${message.substring(0, 50)}...`);
        res.json({ success: true, message: `Broadcast sent to ${users.length} customers.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 18. District Usage Report
app.get('/api/reports/districts', async (req, res) => {
    try {
        const results = await db.query(`
            SELECT c.district, SUM(b.units_used) as total_units, SUM(b.total_amount) as total_revenue
            FROM customers c
            JOIN bills b ON c.account_number = b.account_number
            GROUP BY c.district
            ORDER BY total_units DESC
        `, []);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 19. Get Audit Logs (Admin Only)
app.get('/api/admin/audit-logs', async (req, res) => {
    try {
        const logs = await lite.all('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100', []);
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ========== GLOBAL ERROR HANDLERS (prevent server crashes) ==========
process.on('uncaughtException', (err) => {
    console.error('⚠️ Uncaught Exception (server kept alive):', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('⚠️ Unhandled Rejection (server kept alive):', reason);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Backend server running on port ${PORT}`);
});
