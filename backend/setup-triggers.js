const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'wasco_billing'
});

connection.connect((err) => {
    if (err) {
        console.error('Connection error:', err);
        return;
    }
    console.log('Connected to MySQL for Trigger creation.');

    // 1. Create notifications table in MySQL (Core Node)
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS notifications (
            notification_id INT AUTO_INCREMENT PRIMARY KEY,
            account_number VARCHAR(20) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_read BOOLEAN DEFAULT FALSE
        )
    `;

    // 2. Create Trigger: after_bill_insert
    // This trigger automatically creates a notification when a new bill is generated
    const createTriggerQuery = `
        CREATE TRIGGER after_bill_insert
        AFTER INSERT ON bills
        FOR EACH ROW
        BEGIN
            INSERT INTO notifications (account_number, message)
            VALUES (NEW.account_number, CONCAT('A new bill for ', NEW.billing_month, ' has been generated. Amount: LSL ', NEW.total_amount));
        END
    `;

    connection.query(createTableQuery, (err) => {
        if (err) console.error('Error creating table:', err.message);
        else {
            console.log('✅ Notifications table created in MySQL.');
            
            // We use DROP TRIGGER IF EXISTS to avoid errors on multiple runs
            connection.query('DROP TRIGGER IF EXISTS after_bill_insert', () => {
                connection.query(createTriggerQuery, (errTrig) => {
                    if (errTrig) console.error('Error creating trigger:', errTrig.message);
                    else console.log('✅ MySQL Trigger "after_bill_insert" created successfully.');
                    connection.end();
                });
            });
        }
    });
});
