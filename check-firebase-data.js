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

async function checkFirebaseData() {
  try {
    const app = initializeApp({
      credential: cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    const db = getFirestore(app);
    
    console.log('=== Checking Firebase Database Contents ===');
    
    const collections = ['books', 'words', 'diseases', 'drugs', 'tutorialVideos', 'staff', 'questions', 'notifications', 'users', 'normalRanges', 'appLinks'];
    
    for (const collectionName of collections) {
      try {
        console.log(`\n--- Checking ${collectionName} collection ---`);
        const collectionRef = db.collection(collectionName);
        const snapshot = await collectionRef.limit(5).get();
        
        console.log(`Found ${snapshot.size} documents in ${collectionName}`);
        
        if (snapshot.size > 0) {
          snapshot.forEach((doc, index) => {
            const data = doc.data();
            console.log(`  Document ${index + 1}: ${doc.id}`);
            console.log(`    Fields: ${Object.keys(data).join(', ')}`);
            if (data.title || data.name) {
              console.log(`    Title/Name: ${data.title || data.name}`);
            }
          });
        } else {
          console.log(`  No documents found in ${collectionName}`);
        }
      } catch (error) {
        console.log(`  Error accessing ${collectionName}: ${error.message}`);
      }
    }
    
    // Also check if there are any other collections
    console.log('\n--- Checking for other collections ---');
    try {
      const collections = await db.listCollections();
      console.log('All collections found:', collections.map(c => c.id).join(', '));
    } catch (error) {
      console.log('Could not list collections:', error.message);
    }
    
  } catch (error) {
    console.error('Failed to check Firebase data:', error.message);
  }
}

checkFirebaseData();