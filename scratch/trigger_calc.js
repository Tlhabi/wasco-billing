const http = require('http');

const data = JSON.stringify({ month: 'March 2026' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/calculate-bills',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => responseData += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log('Body:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.write(data);
req.end();
