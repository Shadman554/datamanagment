import fetch from 'node-fetch';

async function testLogin() {
  try {
    console.log('Testing admin login...');
    
    const response = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'superadmin',
        password: 'SuperAdmin123!'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', result.token);
      console.log('Admin:', result.admin);
    } else {
      console.log('❌ Login failed:');
      console.log('Status:', response.status);
      console.log('Error:', result);
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLogin();
