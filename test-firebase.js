import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';

dotenv.config();

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

console.log('Testing Firebase connection...');
console.log('Project ID:', serviceAccount.project_id);
console.log('Client Email:', serviceAccount.client_email);
console.log('Private Key Present:', !!serviceAccount.private_key);

try {
  const app = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });

  const db = getFirestore(app);
  
  console.log('Firebase initialized successfully');
  
  // Test reading from a collection
  const booksRef = db.collection('books');
  const snapshot = await booksRef.limit(1).get();
  
  console.log('Query successful!');
  console.log('Empty:', snapshot.empty);
  console.log('Size:', snapshot.size);
  
  if (!snapshot.empty) {
    snapshot.forEach(doc => {
      console.log('Document ID:', doc.id);
      console.log('Document data:', doc.data());
    });
  }
  
} catch (error) {
  console.error('Firebase test failed:', error.message);
  if (error.code) {
    console.error('Error code:', error.code);
  }
}