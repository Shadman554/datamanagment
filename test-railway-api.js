// Test script to verify Railway API connection and operations
const BASE_URL = 'https://python-database-production.up.railway.app';

async function testRailwayAPI() {
  console.log('Testing Railway API connection...');
  
  try {
    // Test 1: Check if API is accessible
    console.log('\n1. Testing API accessibility...');
    const healthResponse = await fetch(`${BASE_URL}/`);
    console.log(`Health check status: ${healthResponse.status}`);
    
    // Test 2: Try to authenticate
    console.log('\n2. Testing authentication...');
    const authResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });
    
    console.log(`Auth response status: ${authResponse.status}`);
    
    if (authResponse.ok) {
      const authData = await authResponse.json();
      console.log('Authentication successful!');
      console.log('Token received:', authData.access_token ? 'YES' : 'NO');
      
      // Test 3: Try to fetch data with authentication
      console.log('\n3. Testing data fetching with auth...');
      const token = authData.access_token;
      
      const dataResponse = await fetch(`${BASE_URL}/api/books/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      console.log(`Data fetch status: ${dataResponse.status}`);
      
      if (dataResponse.ok) {
        const data = await dataResponse.json();
        console.log(`Books found: ${data.length || 0}`);
      } else {
        const errorText = await dataResponse.text();
        console.log(`Data fetch error: ${errorText}`);
      }
      
      // Test 4: Try to create a test item
      console.log('\n4. Testing data creation...');
      const testBook = {
        title: 'Test Book',
        description: 'Test Description',
        category: 'Test Category',
      };
      
      const createResponse = await fetch(`${BASE_URL}/api/books/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(testBook),
      });
      
      console.log(`Create response status: ${createResponse.status}`);
      
      if (createResponse.ok) {
        const createdBook = await createResponse.json();
        console.log('Book created successfully:', createdBook);
      } else {
        const errorText = await createResponse.text();
        console.log(`Create error: ${errorText}`);
      }
      
    } else {
      const errorText = await authResponse.text();
      console.log(`Auth error: ${errorText}`);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testRailwayAPI().then(() => {
  console.log('\nTest completed!');
}).catch(console.error);