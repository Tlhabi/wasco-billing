const http = require('http');

const API_BASE = 'http://localhost:5000/api';

const endpoints = [
  '/bills',
  '/rates',
  '/reports/usage',
  '/leakages',
  '/customers',
  '/payments',
  '/reports/segments',
  '/reports/districts',
  '/views/balances',
  '/views/leakage-stats',
  '/admin/audit-logs'
];

async function testEndpoint(endpoint) {
  return new Promise((resolve) => {
    http.get(`http://localhost:5000/api${endpoint}`, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          console.log(`✅ ${endpoint}: ${res.statusCode} (${Array.isArray(parsed) ? parsed.length : 'Object'} items)`);
        } catch (e) {
          console.log(`✅ ${endpoint}: ${res.statusCode} (Non-JSON response)`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`❌ ${endpoint}: ${err.message}`);
      resolve();
    });
  });
}

async function run() {
  for (const ep of endpoints) {
    await testEndpoint(ep);
  }
}

run();
