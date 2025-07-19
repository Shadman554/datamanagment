// Test local server create endpoint directly
const BASE_URL = 'http://localhost:5000';

async function testLocalCreate() {
  console.log('🔍 Testing Local Server Create Endpoint...\n');
  
  try {
    // Step 1: Login to local server
    console.log('1. Authenticating with local server...');
    const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });
    
    console.log(`Login response status: ${loginResponse.status}`);
    
    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`);
    }
    
    // Get cookies from response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✅ Authentication successful!');
    console.log('Cookies:', cookies);
    
    // Step 2: Test creating a book using the correct endpoint
    console.log('\n2. Testing book creation via local server...');
    const bookData = {
      title: `Local Test Book ${Date.now()}`,
      description: 'Testing book creation via local server',
      category: 'Test Category'
    };
    
    console.log('Book data to create:', JSON.stringify(bookData, null, 2));
    
    const createResponse = await fetch(`${BASE_URL}/api/collections/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify(bookData),
    });
    
    console.log(`\nCreate response status: ${createResponse.status}`);
    console.log(`Create response headers:`, Object.fromEntries(createResponse.headers.entries()));
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.log(`❌ Create failed: ${errorText}`);
      return;
    }
    
    const result = await createResponse.json();
    console.log('✅ Create successful!');
    console.log('Created book:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testLocalCreate();
