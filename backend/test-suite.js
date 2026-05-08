/**
 * WASCO BILLING SYSTEM — COMPREHENSIVE TEST SUITE
 * Tests: DB Schema, Auth, CRUD, Usage+Billing, Notifications, Payments, Reports, Data Integrity
 * Run: node test-suite.js
 */

const http = require('http');
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();

const API = 'http://127.0.0.1:5000';
let passed = 0, failed = 0, total = 0;
let TEST_ACCOUNT = null; // created during test, cleaned at end

// ─── HELPERS ────────────────────────────────────────────────────────────────

function req(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: '127.0.0.1', port: 5000,
      path, method,
      headers: { 'Content-Type': 'application/json', ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}) }
    };
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    r.on('error', reject);
    if (data) r.write(data);
    r.end();
  });
}

function assert(name, condition, detail = '') {
  total++;
  if (condition) {
    console.log(`  ✅ PASS  ${name}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL  ${name}${detail ? ' — ' + detail : ''}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${'═'.repeat(60)}`);
  console.log(`  ${title}`);
  console.log('═'.repeat(60));
}

// ─── MYSQL ──────────────────────────────────────────────────────────────────

async function testMySQLSchema(conn) {
  section('A. MySQL DATABASE SCHEMA');

  const [tables] = await conn.query('SHOW TABLES');
  const tableNames = tables.map(t => Object.values(t)[0]);
  const required = ['billing_rates','bills','customers','leakage_reports','notifications','user_accounts'];
  for (const t of required) assert(`Table exists: ${t}`, tableNames.includes(t));

  // customers columns
  const [custCols] = await conn.query('DESCRIBE customers');
  const cFields = custCols.map(c => c.Field);
  for (const f of ['account_number','first_name','last_name','address','district','customer_type','email','phone_number'])
    assert(`customers.${f}`, cFields.includes(f));

  // bills columns
  const [billCols] = await conn.query('DESCRIBE bills');
  const bFields = billCols.map(c => c.Field);
  for (const f of ['bill_id','account_number','billing_month','units_used','total_amount','due_date','payment_status'])
    assert(`bills.${f}`, bFields.includes(f));

  // user_accounts columns
  const [uaCols] = await conn.query('DESCRIBE user_accounts');
  const uFields = uaCols.map(c => c.Field);
  for (const f of ['user_id','username','password_hash','role','account_number'])
    assert(`user_accounts.${f}`, uFields.includes(f));

  // billing_rates columns
  const [rateCols] = await conn.query('DESCRIBE billing_rates');
  const rFields = rateCols.map(c => c.Field);
  for (const f of ['rate_id','tier_name','minimum_units','maximum_units','rate_per_unit'])
    assert(`billing_rates.${f}`, rFields.includes(f));

  // Views
  const views = ['view_customer_balances','view_leakage_summary','view_unpaid_bills'];
  for (const v of views) assert(`View exists: ${v}`, tableNames.includes(v));
}

// ─── SQLITE ─────────────────────────────────────────────────────────────────

async function testSQLiteSchema() {
  section('B. SQLite DATABASE SCHEMA');
  return new Promise((resolve) => {
    const db = new sqlite3.Database('C:\\Users\\Lenovo\\Desktop\\wasco_usage.sqlite.db', err => {
      if (err) { assert('SQLite connection', false, err.message); return resolve(); }
      assert('SQLite connection', true);
    });
    db.serialize(() => {
      db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (e, rows) => {
        const names = rows.map(r => r.name);
        for (const t of ['water_usage','payments','notifications'])
          assert(`SQLite table: ${t}`, names.includes(t));
      });
      db.all('PRAGMA table_info(water_usage)', [], (e, cols) => {
        const f = cols.map(c => c.name);
        for (const c of ['id','account_number','billing_month','reading_date','units_used'])
          assert(`water_usage.${c}`, f.includes(c));
      });
      db.all('PRAGMA table_info(notifications)', [], (e, cols) => {
        const f = cols.map(c => c.name);
        for (const c of ['notification_id','account_number','bill_month','notification_type','sent_date','is_read'])
          assert(`notifications.${c}`, f.includes(c));
      });
      db.all('PRAGMA table_info(payments)', [], (e, cols) => {
        const f = cols.map(c => c.name);
        for (const c of ['payment_id','account_number','bill_month','amount_paid','payment_date','payment_method','reference_number'])
          assert(`payments.${c}`, f.includes(c));
        db.close();
        resolve();
      });
    });
  });
}

// ─── AUTH ────────────────────────────────────────────────────────────────────

async function testAuth() {
  section('C. AUTHENTICATION');

  // Admin login
  let r = await req('POST', '/api/login', { username: 'admin', password: 'admin123' });
  assert('Admin login (admin123)', r.status === 200 && r.body.success);
  if (r.status === 200) assert('Admin has role=admin', r.body.user?.role?.toLowerCase() === 'admin');

  // Manager login
  r = await req('POST', '/api/login', { username: 'manager', password: 'manager123' });
  assert('Manager login', r.status === 200 && r.body.success);

  // Customer login (james_mothibi uses plaintext password)
  r = await req('POST', '/api/login', { username: 'james_mothibi', password: 'password123' });
  assert('Customer login (james_mothibi)', r.status === 200 && r.body.success);
  if (r.status === 200) {
    assert('Customer profile: first_name present', !!r.body.user?.first_name);
    assert('Customer profile: email present', !!r.body.user?.email);
    assert('Customer profile: phone present', !!r.body.user?.phone);
    assert('Customer profile: account_number present', !!r.body.user?.account_number);
    assert('Customer profile: customer_type present', !!r.body.user?.customer_type);
  }

  // Bad credentials
  r = await req('POST', '/api/login', { username: 'admin', password: 'wrongpassword' });
  assert('Reject bad credentials (401)', r.status === 401);

  // Missing credentials
  r = await req('POST', '/api/login', { username: '', password: '' });
  assert('Reject empty credentials', r.status !== 200);
}

// ─── CUSTOMER CRUD ──────────────────────────────────────────────────────────

async function testCustomerCRUD() {
  section('D. CUSTOMER CRUD');

  // CREATE
  const payload = {
    username: 'wasco_test_user', password: 'Test@1234',
    first_name: 'Test', last_name: 'Automation',
    email: 'test.auto@wasco.ls', address: '99 Test Lane',
    district: 'Maseru', phone: '5001-0000', customer_type: 'Residential'
  };
  let r = await req('POST', '/api/customers', payload);
  assert('Create customer (POST /api/customers)', r.status === 200 && r.body.success, JSON.stringify(r.body));
  TEST_ACCOUNT = r.body.account_number;
  assert('New account number returned', !!TEST_ACCOUNT, `got: ${TEST_ACCOUNT}`);

  // READ ALL
  r = await req('GET', '/api/customers');
  assert('Read all customers (GET /api/customers)', r.status === 200 && Array.isArray(r.body));
  const found = r.body.find(c => c.account_number === TEST_ACCOUNT);
  assert('New customer appears in list', !!found);
  assert('Customer has phone_number field', found && 'phone_number' in found, 'phone_number missing from response');

  // UPDATE
  r = await req('PUT', `/api/customers/${TEST_ACCOUNT}`, {
    first_name: 'Updated', last_name: 'Automation',
    email: 'updated@wasco.ls', address: '100 Updated Lane',
    district: 'Leribe', phone: '5001-0001', customer_type: 'Business'
  });
  assert('Update customer (PUT /api/customers/:acct)', r.status === 200 && r.body.success, JSON.stringify(r.body));

  // Verify update persisted
  r = await req('GET', '/api/customers');
  const updated = r.body.find(c => c.account_number === TEST_ACCOUNT);
  assert('Updated first_name persisted', updated?.first_name === 'Updated');
  assert('Updated customer_type persisted', updated?.customer_type === 'Business');
}

// ─── SELF REGISTRATION ──────────────────────────────────────────────────────

async function testRegistration() {
  section('E. SELF-REGISTRATION');

  const r = await req('POST', '/api/register', {
    username: 'reg_test_9999', password: 'Reg@Test99',
    first_name: 'Reg', last_name: 'Tester',
    email: 'reg@test.ls', address: 'Plot 77, Teyateyaneng',
    district: 'Berea', phone: '5877-0000', customer_type: 'Industrial'
  });
  assert('Self-registration succeeds', r.status === 200 && r.body.success, JSON.stringify(r.body));

  // Duplicate username
  const r2 = await req('POST', '/api/register', {
    username: 'reg_test_9999', password: 'Other123',
    first_name: 'Another', last_name: 'User',
    address: 'Somewhere', first_name2: 'X'
  });
  assert('Duplicate username rejected (409)', r2.status === 409);

  // Missing fields
  const r3 = await req('POST', '/api/register', { username: 'incomplete_user', password: 'pw' });
  assert('Incomplete registration rejected (400)', r3.status === 400);
}

// ─── BILLING RATES ──────────────────────────────────────────────────────────

async function testBillingRates() {
  section('F. BILLING RATES');

  let r = await req('GET', '/api/rates');
  assert('Get billing rates', r.status === 200 && Array.isArray(r.body) && r.body.length > 0);
  const rate = r.body[0];
  assert('Rate has required fields', 'rate_id' in rate && 'tier_name' in rate && 'rate_per_unit' in rate);

  // Update a rate
  const rateId = rate.rate_id;
  const origRate = rate.rate_per_unit;
  r = await req('PUT', `/api/rates/${rateId}`, {
    tier_name: rate.tier_name, minimum_units: rate.minimum_units,
    maximum_units: rate.maximum_units, rate_per_unit: origRate
  });
  assert('Update billing rate (PUT /api/rates/:id)', r.status === 200 && r.body.success, JSON.stringify(r.body));
}

// ─── USAGE RECORDING + AUTO BILLING ─────────────────────────────────────────

async function testUsageAndBilling() {
  section('G. USAGE RECORDING + AUTO BILL GENERATION');

  const month = 'Test Month 2026';

  // Record usage
  let r = await req('POST', '/api/usage', {
    account_number: TEST_ACCOUNT,
    billing_month: month,
    reading_date: '2026-05-07',
    units_used: 60
  });
  assert('Record usage (POST /api/usage)', r.status === 200 && r.body.success, JSON.stringify(r.body));
  assert('Response includes bill amount', r.body.message?.includes('LSL'), r.body.message);

  // Verify bill was auto-created in MySQL
  r = await req('GET', '/api/bills');
  const bill = r.body.find(b => b.account_number === TEST_ACCOUNT && b.billing_month === month);
  assert('Bill auto-created in MySQL bills table', !!bill, `bills for ${TEST_ACCOUNT} not found`);
  assert('Bill status is Unpaid', bill?.payment_status === 'Unpaid');
  assert('Bill amount > 0', parseFloat(bill?.total_amount) > 0, `amount: ${bill?.total_amount}`);
  assert('Bill has due_date', !!bill?.due_date);
}

// ─── NOTIFICATIONS ──────────────────────────────────────────────────────────

async function testNotifications() {
  section('H. CUSTOMER NOTIFICATIONS');

  // Fetch notifications for test account
  let r = await req('GET', `/api/notifications?account=${TEST_ACCOUNT}`);
  assert('Get notifications (GET /api/notifications?account=)', r.status === 200 && Array.isArray(r.body));
  const notif = r.body.find(n => n.notification_type?.startsWith('Bill Generated'));
  assert('Bill Generated notification exists', !!notif, `got: ${JSON.stringify(r.body.map(n=>n.notification_type))}`);
  assert('Notification has bill_month', !!notif?.bill_month);
  assert('Notification is_read=0 (unread)', notif?.is_read === 0);

  // Mark as read
  if (notif) {
    r = await req('PUT', `/api/notifications/${notif.notification_id}/read`);
    assert('Mark notification as read', r.status === 200 && r.body.success, JSON.stringify(r.body));

    // Verify it's marked read
    r = await req('GET', `/api/notifications?account=${TEST_ACCOUNT}`);
    const updated = r.body.find(n => n.notification_id === notif.notification_id);
    assert('Notification is_read=1 after marking', updated?.is_read === 1);
  }
}

// ─── PAYMENTS ───────────────────────────────────────────────────────────────

async function testPayments() {
  section('I. PAYMENT PROCESSING');

  // Get the unpaid bill for test account
  let r = await req('GET', '/api/bills');
  const bill = r.body.find(b => b.account_number === TEST_ACCOUNT && b.payment_status === 'Unpaid');
  if (!bill) { assert('Unpaid bill exists to pay', false, 'No unpaid bill found for test account'); return; }

  // Make payment
  r = await req('POST', '/api/pay', {
    account_number: TEST_ACCOUNT,
    billing_month: bill.billing_month,
    amount: bill.total_amount,
    payment_method: 'Mobile Money'
  });
  assert('Process payment (POST /api/pay)', r.status === 200 && r.body.success, JSON.stringify(r.body));
  assert('Reference number returned', !!r.body.reference, `got: ${JSON.stringify(r.body)}`);

  // Verify bill status changed
  r = await req('GET', '/api/bills');
  const paid = r.body.find(b => b.account_number === TEST_ACCOUNT && b.billing_month === bill.billing_month);
  assert('Bill status changed to Paid', paid?.payment_status === 'Paid', `got: ${paid?.payment_status}`);

  // Verify payment in SQLite
  r = await req('GET', `/api/payments?account=${TEST_ACCOUNT}`);
  assert('Payment recorded in SQLite', r.status === 200 && r.body.length > 0, JSON.stringify(r.body));
  const payment = r.body[0];
  assert('Payment has reference_number', !!payment?.reference_number);
  assert('Payment has amount_paid', parseFloat(payment?.amount_paid) > 0);
  assert('Payment method recorded', payment?.payment_method === 'Mobile Money');
}

// ─── REPORTS ────────────────────────────────────────────────────────────────

async function testReports() {
  section('J. REPORTS & ANALYTICS');

  let r = await req('GET', '/api/reports/usage');
  assert('Usage report (GET /api/reports/usage)', r.status === 200 && Array.isArray(r.body));

  r = await req('GET', '/api/reports/segments');
  assert('Segment report (GET /api/reports/segments)', r.status === 200 && Array.isArray(r.body));

  r = await req('GET', '/api/views/balances');
  assert('Customer balances view', r.status === 200 && Array.isArray(r.body));

  r = await req('GET', '/api/views/leakage-stats');
  assert('Leakage stats view', r.status === 200 && Array.isArray(r.body));
}

// ─── LEAKAGE REPORTS ────────────────────────────────────────────────────────

async function testLeakage() {
  section('K. LEAKAGE REPORTING');

  let r = await req('POST', '/api/leakages', {
    account_number: TEST_ACCOUNT,
    location: '99 Test Lane, near main pipe',
    description: 'Automated test leakage report'
  });
  assert('Submit leakage report', r.status === 200 && r.body.success, JSON.stringify(r.body));

  r = await req('GET', '/api/leakages');
  assert('Get all leakage reports', r.status === 200 && Array.isArray(r.body));
  const leak = r.body.find(l => l.account_number === TEST_ACCOUNT);
  assert('Submitted report appears in list', !!leak);
}

// ─── CASCADE DELETE ──────────────────────────────────────────────────────────

async function testCascadeDelete(conn) {
  section('L. CASCADE DELETE — DATA INTEGRITY');

  // Verify account exists before delete
  const [before] = await conn.query('SELECT account_number FROM customers WHERE account_number=?', [TEST_ACCOUNT]);
  assert('Test account exists before delete', before.length > 0);

  const [billsBefore] = await conn.query('SELECT bill_id FROM bills WHERE account_number=?', [TEST_ACCOUNT]);
  assert('Bills exist for test account before delete', billsBefore.length > 0);

  // DELETE via API
  const r = await req('DELETE', `/api/customers/${TEST_ACCOUNT}`);
  assert('Delete customer (DELETE /api/customers/:acct)', r.status === 200 && r.body.success, JSON.stringify(r.body));

  // MySQL cascades
  const [custAfter] = await conn.query('SELECT account_number FROM customers WHERE account_number=?', [TEST_ACCOUNT]);
  assert('Customer removed from MySQL customers', custAfter.length === 0);

  const [billsAfter] = await conn.query('SELECT bill_id FROM bills WHERE account_number=?', [TEST_ACCOUNT]);
  assert('Bills removed from MySQL bills', billsAfter.length === 0);

  const [uaAfter] = await conn.query('SELECT user_id FROM user_accounts WHERE account_number=?', [TEST_ACCOUNT]);
  assert('User account removed from MySQL user_accounts', uaAfter.length === 0);

  // SQLite cascades
  await new Promise(resolve => {
    const db = new sqlite3.Database('C:\\Users\\Lenovo\\Desktop\\wasco_usage.sqlite.db');
    db.serialize(() => {
      db.all('SELECT id FROM water_usage WHERE account_number=?', [TEST_ACCOUNT], (e, r) => {
        assert('water_usage cleaned in SQLite', !e && r.length === 0, e?.message);
      });
      db.all('SELECT payment_id FROM payments WHERE account_number=?', [TEST_ACCOUNT], (e, r) => {
        assert('payments cleaned in SQLite', !e && r.length === 0, e?.message);
      });
      db.all('SELECT notification_id FROM notifications WHERE account_number=?', [TEST_ACCOUNT], (e, r) => {
        assert('notifications cleaned in SQLite', !e && r.length === 0, e?.message);
        db.close();
        resolve();
      });
    });
  });
}

// ─── CLEANUP REG TEST ────────────────────────────────────────────────────────

async function cleanupRegTest(conn) {
  section('M. CLEANUP REGISTRATION TEST DATA');
  try {
    const [reg] = await conn.query('SELECT account_number FROM user_accounts WHERE username=?', ['reg_test_9999']);
    if (reg.length > 0) {
      const acc = reg[0].account_number;
      await conn.query('DELETE FROM bills WHERE account_number=?', [acc]);
      await conn.query('DELETE FROM user_accounts WHERE username=?', ['reg_test_9999']);
      await conn.query('DELETE FROM customers WHERE account_number=?', [acc]);
      assert('Reg test account cleaned up', true);
    } else {
      assert('Reg test account cleaned up (already gone)', true);
    }
  } catch(e) {
    assert('Reg test cleanup', false, e.message);
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n' + '█'.repeat(60));
  console.log('  WASCO BILLING SYSTEM — FULL TEST SUITE');
  console.log('  ' + new Date().toLocaleString());
  console.log('█'.repeat(60));

  let conn;
  try {
    conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '12345678', database: 'wasco_billing' });
    assert('MySQL connection', true);
  } catch(e) {
    assert('MySQL connection', false, e.message);
    console.log('\n❌ Cannot connect to MySQL — aborting.'); return;
  }

  // Check backend health
  try {
    const r = await req('GET', '/');
    assert('Backend server reachable', r.status === 200);
  } catch(e) {
    assert('Backend server reachable', false, 'Is node server.js running?');
    console.log('\n❌ Backend unreachable — aborting.'); conn.end(); return;
  }

  await testMySQLSchema(conn);
  await testSQLiteSchema();
  await testAuth();
  await testCustomerCRUD();
  await testRegistration();
  await testBillingRates();
  await testUsageAndBilling();
  await testNotifications();
  await testPayments();
  await testReports();
  await testLeakage();
  await testCascadeDelete(conn);
  await cleanupRegTest(conn);

  conn.end();

  // SUMMARY
  console.log('\n' + '═'.repeat(60));
  console.log('  TEST RESULTS SUMMARY');
  console.log('═'.repeat(60));
  console.log(`  Total:   ${total}`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  Score:   ${Math.round((passed/total)*100)}%`);
  console.log('═'.repeat(60) + '\n');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(e => { console.error('Unexpected error:', e); process.exit(1); });
