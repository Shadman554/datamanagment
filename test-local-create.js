// Test local server create operation with detailed logging
const LOCAL_URL = 'http://localhost:5000';

async function testLocalCreate() {
  console.log('🔍 Testing Local Server Create Operation...\n');
  
  try {
    // Step 1: Check current book count
    console.log('1. Checking current book count...');
    const listRes1 = await fetch(`${LOCAL_URL}/api/collections/books`);
    if (listRes1.ok) {
      const books1 = await listRes1.json();
      console.log('Current book count:', books1.length || books1.total || 'unknown');
    } else {
      console.log('Failed to get book list:', listRes1.status);
    }
    
    // Step 2: Try to create a book
    console.log('\n2. Creating a new book...');
    const bookData = {
      title: `Test Book ${Date.now()}`,
      category: 'Test Category',
      description: 'Test Description'
    };
    
    console.log('Book data:', JSON.stringify(bookData, null, 2));
    
    const createRes = await fetch(`${LOCAL_URL}/api/collections/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In browser, cookies are sent automatically
      },
      body: JSON.stringify(bookData)
    });
    
    console.log('Create response status:', createRes.status);
    console.log('Create response headers:', Object.fromEntries(createRes.headers.entries()));
    
    if (createRes.ok) {
      const result = await createRes.json();
      console.log('✅ Create response:', JSON.stringify(result, null, 2));
    } else {
      const errorText = await createRes.text();
      console.log('❌ Create failed:', errorText);
    }
    
    // Step 3: Check book count again
    console.log('\n3. Checking book count after create...');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    const listRes2 = await fetch(`${LOCAL_URL}/api/collections/books`);
    if (listRes2.ok) {
      const books2 = await listRes2.json();
      console.log('Book count after create:', books2.length || books2.total || 'unknown');
      
      // Look for our book
      const ourBook = books2.find ? books2.find(book => book.title === bookData.title) : null;
      if (ourBook) {
        console.log('✅ Our book found in list!');
      } else {
        console.log('❌ Our book NOT found in list!');
      }
    }
    
    // Step 4: Test Railway API directly
    console.log('\n4. Testing Railway API directly...');
    const railwayRes = await fetch('https://python-database-production.up.railway.app/api/books/?limit=5');
    if (railwayRes.ok) {
      const railwayBooks = await railwayRes.json();
      console.log('Railway API book count:', railwayBooks.total);
      console.log('Recent books from Railway:', railwayBooks.items?.slice(0, 2).map(b => b.title) || 'none');
    }
    
  } catch (error) {
    console.log('💥 Test failed:', error.message);
  }
}

// Run in browser console
console.log('Run this in your browser console while on localhost:5000');
console.log('testLocalCreate()');

// For Node.js testing
if (typeof window === 'undefined') {
  testLocalCreate();
}
