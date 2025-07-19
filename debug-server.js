// Debug test to check what's happening with the server
// Use built-in fetch in Node 18+

async function debugServer() {
  console.log('🔍 Debugging Local Server...\n');
  
  try {
    // Test 1: Check if server is responding
    console.log('1. Testing server health...');
    const healthRes = await fetch('http://localhost:5000/health');
    if (healthRes.ok) {
      const health = await healthRes.json();
      console.log('✅ Server is healthy:', health);
    } else {
      console.log('❌ Server health check failed:', healthRes.status);
    }
    
    // Test 2: Check books endpoint
    console.log('\n2. Testing books endpoint...');
    const booksRes = await fetch('http://localhost:5000/api/collections/books');
    console.log('Books endpoint status:', booksRes.status);
    
    if (booksRes.ok) {
      const books = await booksRes.json();
      console.log('Current books count:', books.length || books.total || 'unknown');
    } else {
      const error = await booksRes.text();
      console.log('Books endpoint error:', error);
    }
    
    // Test 3: Try to create without auth (should fail)
    console.log('\n3. Testing create without auth (should fail)...');
    const noAuthRes = await fetch('http://localhost:5000/api/collections/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Book No Auth',
        category: 'Test'
      })
    });
    
    console.log('No auth create status:', noAuthRes.status);
    if (!noAuthRes.ok) {
      const error = await noAuthRes.text();
      console.log('Expected auth error:', error);
    }
    
    // Test 4: Check Railway API directly
    console.log('\n4. Testing Railway API directly...');
    
    // Login to Railway API
    const loginRes = await fetch('https://python-database-production.up.railway.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (loginRes.ok) {
      const auth = await loginRes.json();
      console.log('✅ Railway API login successful');
      
      // Get current count
      const railwayBooksRes = await fetch('https://python-database-production.up.railway.app/api/books/', {
        headers: { 'Authorization': `Bearer ${auth.access_token}` }
      });
      
      if (railwayBooksRes.ok) {
        const railwayBooks = await railwayBooksRes.json();
        console.log('Railway API books count:', railwayBooks.total);
      }
    } else {
      console.log('❌ Railway API login failed');
    }
    
  } catch (error) {
    console.log('💥 Debug failed:', error.message);
  }
}

debugServer();
