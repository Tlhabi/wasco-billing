const fs = require('fs');
const content = fs.readFileSync('frontend/src/App.jsx', 'utf8');
const regexStr = "\\s*\\{(?:view === 'admin' \\|\\| view === 'manager') && \\(\\s*<div className=\\{\\`nav-item \\$\\{activeTab === 'users' \\? 'active' : ''\\}\\`\\} onClick=\\{\\(\\) => setActiveTab\\('users'\\)\\}>\\s*<Users size=\\{18\\} \\/> <span>Customers<\\/span>\\s*<\\/div>\\s*\\)\\}\\s*\\{view === 'admin' && \\(";
const regex = new RegExp(regexStr);
console.log('Match found:', regex.test(content));
