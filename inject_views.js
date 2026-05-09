const mysql = require('mysql2');

const cloudConfig = {
    host: 'bjbbx5quifwdulzjklky-mysql.services.clever-cloud.com',
    user: 'uc0218pjkdfymjtr',
    password: 'H12uhHsh2Nz5qMxgeWTw',
    database: 'bjbbx5quifwdulzjklky'
};

const connection = mysql.createConnection(cloudConfig);

const views = [
    {
        name: 'view_unpaid_bills',
        query: `
            CREATE OR REPLACE VIEW view_unpaid_bills AS
            SELECT 
                b.bill_id,
                b.account_number,
                c.first_name,
                c.last_name,
                b.billing_month,
                b.total_amount,
                b.due_date
            FROM bills b
            JOIN customers c ON b.account_number = c.account_number
            WHERE b.payment_status = 'Unpaid'
        `
    },
    {
        name: 'view_customer_balances',
        query: `
            CREATE OR REPLACE VIEW view_customer_balances AS
            SELECT 
                c.account_number,
                c.first_name,
                c.last_name,
                COUNT(b.bill_id) as unpaid_count,
                SUM(b.total_amount) as total_outstanding
            FROM customers c
            LEFT JOIN bills b ON c.account_number = b.account_number AND b.payment_status = 'Unpaid'
            GROUP BY c.account_number, c.first_name, c.last_name
        `
    },
    {
        name: 'view_leakage_summary',
        query: `
            CREATE OR REPLACE VIEW view_leakage_summary AS
            SELECT 
                status,
                COUNT(*) as report_count
            FROM leakage_reports
            GROUP BY status
        `
    }
];

connection.connect((err) => {
    if (err) {
        console.error('Connection error:', err);
        return;
    }
    console.log('Connected to Clever Cloud MySQL for View creation.');

    let completed = 0;
    views.forEach(view => {
        connection.query(view.query, (err) => {
            if (err) {
                console.error(`Error creating view ${view.name}:`, err.message);
            } else {
                console.log(`✅ View ${view.name} created successfully.`);
            }
            completed++;
            if (completed === views.length) {
                connection.end();
            }
        });
    });
});
