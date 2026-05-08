const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ========== CONNECT TO MySQL (External Cloud DB) ==========
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '12345678',
    database: process.env.DB_NAME || 'wasco_billing',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0
});

const db = {
    query: (sql, params) => new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    })
};

// ========== CONNECT TO SQLite (Cloud Functions /tmp storage) ==========
const sqlitePath = path.join('/tmp', 'wasco_usage.sqlite.db');

// Initialize SQLite on startup
function getSqliteConnection() {
    return new sqlite3.Database(sqlitePath);
}

const sqliteConnection = getSqliteConnection();

// Ensure Tables exist in /tmp SQLite on every cold start
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
    console.log('✅ SQLite (Cloud Functions /tmp) initialized.');
});

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

// Helper: Bill Calculation
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

// --- PORTED API ENDPOINTS ---

app.get('/', (req, res) => res.send('WASCO Cloud Function Backend Active.'));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const results = await db.query('SELECT * FROM user_accounts WHERE username = ?', [username]);
        if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = results[0];
        const match = await bcrypt.compare(password, user.password_hash).catch(() => false);
        if (match || password === user.password_hash) {
            let profile = {};
            if (user.account_number) {
                const custResults = await db.query('SELECT * FROM customers WHERE account_number = ?', [user.account_number]);
                if (custResults.length > 0) profile = custResults[0];
            }
            res.json({ success: true, user: { id: user.user_id, role: user.role, account_number: user.account_number, ...profile } });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/bills', async (req, res) => {
    try { res.json(await db.query('SELECT * FROM bills ORDER BY due_date DESC', [])); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/usage', async (req, res) => {
    try { res.json(await lite.all('SELECT * FROM water_usage', [])); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/pay', async (req, res) => {
    const { account_number, billing_month, amount } = req.body;
    try {
        await db.query('UPDATE bills SET payment_status = "Paid", payment_date = CURDATE() WHERE account_number = ? AND billing_month = ?', [account_number, billing_month]);
        const refNumber = 'REF-' + Math.floor(Math.random() * 1000000);
        await lite.run('INSERT INTO payments (account_number, bill_month, amount_paid, payment_date, payment_method, reference_number) VALUES (?, ?, ?, date("now"), "Online", ?)', [account_number, billing_month, amount, refNumber]);
        res.json({ success: true, reference: refNumber });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/usage', async (req, res) => {
    const { account_number, billing_month, reading_date, units_used } = req.body;
    try {
        await lite.run('INSERT INTO water_usage (account_number, billing_month, reading_date, units_used) VALUES (?, ?, ?, ?)', [account_number, billing_month, reading_date, units_used]);
        const rates = await db.query('SELECT * FROM billing_rates ORDER BY minimum_units ASC', []);
        const totalAmount = calculateBill(parseInt(units_used), rates);
        await db.query('INSERT INTO bills (account_number, billing_month, units_used, total_amount, due_date, payment_status) VALUES (?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 14 DAY), "Unpaid")', [account_number, billing_month, units_used, totalAmount]);
        await lite.run('INSERT INTO notifications (account_number, bill_month, notification_type, sent_date, sent_to, is_read) VALUES (?, ?, ?, ?, ?, 0)', [account_number, billing_month, `Bill Generated - LSL ${totalAmount.toFixed(2)}`, new Date().toISOString().split('T')[0], 'Customer Portal']);
        res.json({ success: true, message: 'Usage and Bill recorded.' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/customers', async (req, res) => {
    try { res.json(await db.query('SELECT * FROM customers', [])); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/rates', async (req, res) => {
    try { res.json(await db.query('SELECT * FROM billing_rates ORDER BY minimum_units', [])); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/notifications', async (req, res) => {
    const { account } = req.query;
    try { res.json(await lite.all('SELECT * FROM notifications WHERE account_number = ? ORDER BY sent_date DESC LIMIT 20', [account])); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/leakages', async (req, res) => {
    try { res.json(await db.query('SELECT * FROM leakage_reports ORDER BY report_date DESC', [])); } 
    catch (err) { res.status(500).json({ error: err.message }); }
});

// Export as Firebase Function
exports.api = functions.https.onRequest(app);
