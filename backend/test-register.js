const axios = require('axios');

async function testRegister() {
  try {
    const res = await axios.post('http://localhost:5000/api/register', {
      username: 'testuser' + Date.now(),
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      address: '123 Test St',
      district: 'Maseru',
      phone: '12345678'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testRegister();
