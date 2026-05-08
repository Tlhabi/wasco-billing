const sqlite3 = require('sqlite3').verbose();
const sqlitePath = 'C:\\\\Users\\\\Lenovo\\\\Desktop\\\\wasco_usage.sqlite.db';
const db = new sqlite3.Database(sqlitePath);

db.serialize(() => {
    // 1. Create water_usage table
    db.run(`CREATE TABLE IF NOT EXISTS water_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_number TEXT NOT NULL,
        billing_month TEXT NOT NULL,
        units_used INTEGER NOT NULL
    )`);

    // 2. Create payments table
    db.run(`CREATE TABLE IF NOT EXISTS payments (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_number TEXT NOT NULL,
        bill_month TEXT NOT NULL,
        amount_paid REAL NOT NULL,
        payment_date TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        reference_number TEXT NOT NULL
    )`);

    // 3. Insert some sample data for usage
    const stmt = db.prepare("INSERT INTO water_usage (account_number, billing_month, units_used) VALUES (?, ?, ?)");
    stmt.run("WASCO-001", "March 2026", 250);
    stmt.run("WASCO-002", "March 2026", 50);
    stmt.run("WASCO-003", "March 2026", 200);
    stmt.run("WASCO-004", "March 2026", 15);
    stmt.run("WASCO-005", "March 2026", 30);
    stmt.run("WASCO-006", "March 2026", 500);
    stmt.finalize();

    console.log("✅ SQLite database initialized with tables and sample data.");
});

db.close();
