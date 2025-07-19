// Simple test to check Railway API create issue
const BASE_URL = 'https://python-database-production.up.railway.app';

async function simpleTest() {
  try {
    // Login
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const auth = await loginRes.json();
    console.log('Login status:', loginRes.status);
    
    if (!loginRes.ok) {
      console.log('Login failed:', auth);
      return;
    }
    
    // Try to create a book
    const bookData = {
      title: 'Simple Test Book',
      category: 'Test',
      description: 'Testing'
    };
    
    const createRes = await fetch(`${BASE_URL}/api/books/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.access_token}`
      },
      body: JSON.stringify(bookData)
    });
    
    console.log('Create status:', createRes.status);
    
    if (createRes.ok) {
      const result = await createRes.json();
      console.log('SUCCESS: Book created with ID:', result.id);
    } else {
      const error = await createRes.text();
      console.log('FAILED:', error);
    }
    
    // Check total books
    const listRes = await fetch(`${BASE_URL}/api/books/`);
    const books = await listRes.json();
    console.log('Total books:', books.total || books.length);
    
  } catch (error) {
    console.log('ERROR:', error.message);
  }
}

simpleTest();
