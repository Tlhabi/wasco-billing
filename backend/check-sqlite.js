const sqlite3 = require('sqlite3').verbose();
const sqlitePath = 'C:\\\\Users\\\\Lenovo\\\\Desktop\\\\wasco_usage.sqlite.db';
const db = new sqlite3.Database(sqlitePath, (err) => {
    if (err) { console.error('Connection error:', err); return; }
    console.log('Connected to SQLite');
    
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        if (err) { console.error('Error:', err); return; }
        console.log('Tables:', tables);
        
        tables.forEach(t => {
            db.all(`PRAGMA table_info(${t.name})`, (err, cols) => {
                if (err) { console.error(err); return; }
                console.log(`\nSchema for ${t.name}:`);
                cols.forEach(c => console.log(`  ${c.name} (${c.type})`));
            });
        });
        
        setTimeout(() => db.close(), 1000);
    });
});
