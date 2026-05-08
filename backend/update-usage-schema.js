const sqlite3 = require('sqlite3').verbose();
const sqlitePath = 'C:\\\\Users\\\\Lenovo\\\\Desktop\\\\wasco_usage.sqlite.db';
const db = new sqlite3.Database(sqlitePath);

db.serialize(() => {
    // Drop and recreate with reading_date for better reporting
    db.run(`DROP TABLE IF EXISTS water_usage`);
    db.run(`CREATE TABLE water_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_number TEXT NOT NULL,
        billing_month TEXT NOT NULL,
        reading_date DATE NOT NULL,
        units_used INTEGER NOT NULL
    )`);

    // Insert data with various dates to support daily/weekly/monthly/yearly reports
    const stmt = db.prepare("INSERT INTO water_usage (account_number, billing_month, reading_date, units_used) VALUES (?, ?, ?, ?)");
    
    // March 2026
    stmt.run("WASCO-001", "March 2026", "2026-03-01", 100);
    stmt.run("WASCO-001", "March 2026", "2026-03-15", 150);
    stmt.run("WASCO-002", "March 2026", "2026-03-10", 50);
    stmt.run("WASCO-003", "March 2026", "2026-03-20", 200);
    
    // Feb 2026
    stmt.run("WASCO-001", "February 2026", "2026-02-10", 120);
    stmt.run("WASCO-002", "February 2026", "2026-02-15", 80);
    
    // Jan 2026
    stmt.run("WASCO-001", "January 2026", "2026-01-05", 90);
    
    // 2025 data
    stmt.run("WASCO-001", "December 2025", "2025-12-20", 110);
    stmt.run("WASCO-002", "December 2025", "2025-12-25", 95);

    stmt.finalize();

    console.log("✅ SQLite water_usage table updated with reading_date.");
});

db.close();
