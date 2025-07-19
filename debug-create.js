// Debug script to test Railway API create operations
const BASE_URL = 'https://python-database-production.up.railway.app';

async function debugCreateOperation() {
  console.log('🔍 Debugging Railway API Create Operations...\n');
  
  try {
    // Step 1: Login and get token
    console.log('1. Authenticating with Railway API...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} - ${await loginResponse.text()}`);
    }
    
    const authData = await loginResponse.json();
    const token = authData.access_token;
    console.log('✅ Authentication successful!');
    console.log(`Token: ${token.substring(0, 20)}...`);
    
    // Step 2: Test creating a book
    console.log('\n2. Testing book creation...');
    const bookData = {
      title: `Debug Test Book ${Date.now()}`,
      description: 'Testing book creation via debug script',
      category: 'Debug Category'
    };
    
    console.log('Book data to create:', JSON.stringify(bookData, null, 2));
    
    const createResponse = await fetch(`${BASE_URL}/api/books/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookData),
    });
    
    console.log(`Create response status: ${createResponse.status}`);
    console.log(`Create response headers:`, Object.fromEntries(createResponse.headers.entries()));
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Create failed!');
      console.error(`Error: ${errorText}`);
      
      // Try to parse as JSON for better error details
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Error details:', JSON.stringify(errorJson, null, 2));
      } catch (e) {
        console.error('Raw error text:', errorText);
      }
      return;
    }
    
    const createdBook = await createResponse.json();
    console.log('✅ Book created successfully!');
    console.log('Created book:', JSON.stringify(createdBook, null, 2));
    
    // Step 3: Verify the book was actually saved
    console.log('\n3. Verifying book was saved...');
    const verifyResponse = await fetch(`${BASE_URL}/api/books/`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (verifyResponse.ok) {
      const books = await verifyResponse.json();
      console.log(`Total books in database: ${books.total || books.length || 'unknown'}`);
      
      // Look for our created book
      const ourBook = books.items ? 
        books.items.find(book => book.title === bookData.title) :
        books.find(book => book.title === bookData.title);
        
      if (ourBook) {
        console.log('✅ Book found in database!');
        console.log('Book in database:', JSON.stringify(ourBook, null, 2));
      } else {
        console.log('❌ Book NOT found in database!');
        console.log('This suggests the create operation failed silently.');
      }
    }
    
    // Step 4: Test other endpoints
    console.log('\n4. Testing other create endpoints...');
    
    // Test disease creation
    const diseaseData = {
      name: `Debug Disease ${Date.now()}`,
      symptoms: 'Debug symptoms',
      cause: 'Debug cause',
      control: 'Debug control'
    };
    
    console.log('\nTesting disease creation...');
    const diseaseResponse = await fetch(`${BASE_URL}/api/diseases/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(diseaseData),
    });
    
    console.log(`Disease create status: ${diseaseResponse.status}`);
    if (diseaseResponse.ok) {
      const createdDisease = await diseaseResponse.json();
      console.log('✅ Disease created:', createdDisease.name);
    } else {
      const errorText = await diseaseResponse.text();
      console.log('❌ Disease creation failed:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Debug script failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the debug
debugCreateOperation();
