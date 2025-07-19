// Test local server create operations
const LOCAL_URL = 'http://localhost:5000';

async function testLocalServer() {
  console.log('🔍 Testing Local Server Create Operations...\n');
  
  try {
    // Step 1: Test without authentication (should fail)
    console.log('1. Testing create without authentication...');
    const noAuthRes = await fetch(`${LOCAL_URL}/api/collections/books`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Book No Auth',
        category: 'Test'
      })
    });
    
    console.log('No auth status:', noAuthRes.status);
    if (!noAuthRes.ok) {
      const error = await noAuthRes.text();
      console.log('Expected error:', error);
    }
    
    // Step 2: Try to login to local admin
    console.log('\n2. Testing local admin login...');
    const loginRes = await fetch(`${LOCAL_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'superadmin',
        password: 'SuperAdmin123!'
      })
    });
    
    console.log('Local login status:', loginRes.status);
    
    if (loginRes.ok) {
      console.log('✅ Local admin login successful');
      
      // Get cookies from response
      const cookies = loginRes.headers.get('set-cookie');
      console.log('Cookies received:', cookies);
      
      // Step 3: Test create with authentication
      console.log('\n3. Testing create with local authentication...');
      const authHeaders = {
        'Content-Type': 'application/json'
      };
      
      if (cookies) {
        authHeaders['Cookie'] = cookies;
      }
      
      const authRes = await fetch(`${LOCAL_URL}/api/collections/books`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: 'Test Book With Auth',
          category: 'Test Category'
        })
      });
      
      console.log('Auth create status:', authRes.status);
      
      if (authRes.ok) {
        const result = await authRes.json();
        console.log('✅ SUCCESS! Local create worked:', result);
      } else {
        const error = await authRes.text();
        console.log('❌ Local create failed:', error);
      }
      
    } else {
      const error = await loginRes.text();
      console.log('❌ Local login failed:', error);
    }
    
    // Step 4: Test direct Railway API call from local server context
    console.log('\n4. Testing if local server can reach Railway API...');
    const railwayTestRes = await fetch(`${LOCAL_URL}/api/test-railway`, {
      method: 'GET'
    });
    
    if (railwayTestRes.ok) {
      const result = await railwayTestRes.json();
      console.log('Railway API test result:', result);
    } else {
      console.log('Railway API test failed:', await railwayTestRes.text());
    }
    
  } catch (error) {
    console.log('💥 Local server test failed:', error.message);
  }
}

testLocalServer();
