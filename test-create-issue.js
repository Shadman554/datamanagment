// Test to identify the exact create issue
const BASE_URL = 'https://python-database-production.up.railway.app';

async function testCreateIssue() {
  console.log('🔍 Testing Railway API Create Issue...\n');
  
  try {
    // Step 1: Login
    console.log('1. Logging in...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (!loginRes.ok) {
      console.log('❌ Login failed:', await loginRes.text());
      return;
    }
    
    const auth = await loginRes.json();
    console.log('✅ Login successful');
    
    // Step 2: Test book creation with minimal required fields
    console.log('\n2. Testing book creation...');
    const bookData = {
      title: 'Test Book ' + Date.now(),
      category: 'Test Category'
    };
    
    console.log('Creating book:', bookData);
    
    const createRes = await fetch(`${BASE_URL}/api/books/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.access_token}`
      },
      body: JSON.stringify(bookData)
    });
    
    console.log('Response status:', createRes.status);
    console.log('Response headers:', Object.fromEntries(createRes.headers.entries()));
    
    if (createRes.ok) {
      const result = await createRes.json();
      console.log('✅ SUCCESS! Book created:', result);
      
      // Verify it exists
      const listRes = await fetch(`${BASE_URL}/api/books/?limit=1`);
      const books = await listRes.json();
      console.log('Total books now:', books.total);
      
    } else {
      const errorText = await createRes.text();
      console.log('❌ FAILED! Error:', errorText);
      
      // Try to parse error details
      try {
        const errorJson = JSON.parse(errorText);
        console.log('Error details:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.log('Raw error:', errorText);
      }
    }
    
    // Step 3: Test other endpoints
    console.log('\n3. Testing disease creation...');
    const diseaseData = {
      name: 'Test Disease ' + Date.now()
    };
    
    const diseaseRes = await fetch(`${BASE_URL}/api/diseases/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.access_token}`
      },
      body: JSON.stringify(diseaseData)
    });
    
    console.log('Disease create status:', diseaseRes.status);
    if (diseaseRes.ok) {
      const result = await diseaseRes.json();
      console.log('✅ Disease created:', result.name);
    } else {
      console.log('❌ Disease failed:', await diseaseRes.text());
    }
    
  } catch (error) {
    console.log('💥 Test failed:', error.message);
  }
}

testCreateIssue();
