const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function runFullTest() {
  console.log('🚀 Starting Full A-Z Test Suite for WASCO Billing System...\n');

  try {
    // 1. Test Admin Broadcast
    console.log('--- Testing Broadcast Notification ---');
    const broadcastRes = await axios.post(`${API_BASE}/notifications/broadcast`, {
      message: 'TEST BROADCAST: System maintenance scheduled for tonight.',
      type: 'System Update'
    });
    console.log('✅ Broadcast Status:', broadcastRes.data.message);

    // 2. Test District Reports
    console.log('\n--- Testing District Analytics ---');
    const reportsRes = await axios.get(`${API_BASE}/reports/districts`);
    console.log('✅ Reports Data:', reportsRes.data.length, 'districts found.');
    if (reportsRes.data.length > 0) {
      console.log('   Sample:', reportsRes.data[0]);
    }

    // 3. Test Leakage Reporting (as a customer)
    console.log('\n--- Testing Leakage Reporting ---');
    const leakageRes = await axios.post(`${API_BASE}/leakages`, {
      account_number: 'WASCO-003',
      location: 'Test Location 123',
      description: 'Test leakage description'
    });
    console.log('✅ Leakage Reported:', leakageRes.data.message);
    const reportId = leakageRes.data.report_id;

    // 4. Test Leakage Status Update (as a manager)
    console.log('\n--- Testing Leakage Status Update ---');
    const updateRes = await axios.put(`${API_BASE}/leakages/${reportId}`, {
      status: 'Investigating'
    });
    console.log('✅ Leakage Status Updated:', updateRes.data.message);

    // 5. Test Customer Profile Update
    console.log('\n--- Testing Customer Profile Update ---');
    const profileRes = await axios.put(`${API_BASE}/customers/WASCO-003`, {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe.updated@example.com',
      phone: '555-9999',
      address: 'Updated Address',
      district: 'Maseru',
      customer_type: 'Residential'
    });
    console.log('✅ Profile Update:', profileRes.data.message);

    // 6. Check Database for Updates
    console.log('\n--- Checking Database Consistency ---');
    const customersRes = await axios.get(`${API_BASE}/customers`);
    const updatedUser = customersRes.data.find(c => c.account_number === 'WASCO-003');

    if (updatedUser.email === 'john.doe.updated@example.com') {
      console.log('✅ Database successfully updated (MySQL)');
    } else {
      console.log('❌ Database update mismatch (MySQL)');
    }

    const leakagesRes = await axios.get(`${API_BASE}/leakages`);
    const updatedLeakage = leakagesRes.data.find(l => l.report_id === reportId);
    if (updatedLeakage.status === 'Investigating') {
      console.log('✅ Database successfully updated (SQLite)');
    } else {
      console.log('❌ Database update mismatch (SQLite)');
    }

    console.log('\n✨ FULL TEST SUITE PASSED SUCCESSFULLY! ✨');

  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED!');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', err.response.data);
    } else {
      console.error('Message:', err.message);
    }
    process.exit(1);
  }
}

runFullTest();
