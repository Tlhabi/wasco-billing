const fs = require('fs');
const content = fs.readFileSync('c:/Users/Lenovo/Desktop/wasco-billing/frontend/src/App.jsx', 'utf8');
const lines = content.split('\n');

let balance = 0;
lines.forEach((line, i) => {
  const opens = (line.match(/\{/g) || []).length;
  const closes = (line.match(/\}/g) || []).length;
  balance += opens;
  balance -= closes;
  if (balance < 0) {
    console.log(`Mismatch at line ${i + 1}: balance = ${balance}`);
    balance = 0; // reset to find next
  }
});
console.log(`Final balance: ${balance}`);
