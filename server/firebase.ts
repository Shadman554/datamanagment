import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Function to format private key properly
function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) {
    console.error('No private key provided');
    return undefined;
  }
  
  let formattedKey = key;
  
  // Handle multiple escape patterns
  formattedKey = formattedKey
    .replace(/\\\\n/g, '\n')  // Double escaped
    .replace(/\\n/g, '\n')    // Single escaped
    .trim();
  
  // Debug the key format
  console.log('Private key format check:');
  console.log('- Key length:', formattedKey.length);
  console.log('- Starts with BEGIN:', formattedKey.includes('-----BEGIN PRIVATE KEY-----'));
  console.log('- Ends with END:', formattedKey.includes('-----END PRIVATE KEY-----'));
  console.log('- Contains newlines:', formattedKey.includes('\n'));
  
  if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.error('Private key missing BEGIN marker');
    console.error('Key preview:', formattedKey.substring(0, 100) + '...');
  }
  
  return formattedKey;
}

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

// Initialize Firebase Admin SDK only if credentials are available
let app: any = null;
let isFirebaseInitialized = false;

if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
  if (getApps().length === 0) {
    try {
      console.log('Initializing Firebase Admin SDK...');
      app = initializeApp({
        credential: cert(serviceAccount as any),
        projectId: serviceAccount.project_id,
        storageBucket: "vet-dict-93f36.firebasestorage.app",
      });
      console.log('Firebase Admin SDK initialized successfully');
      isFirebaseInitialized = true;
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      console.warn('⚠️ Application will run without Firebase connection');
    }
  } else {
    app = getApps()[0];
    isFirebaseInitialized = true;
  }
} else {
  console.warn('Missing Firebase configuration:', {
    project_id: !!serviceAccount.project_id,
    private_key: !!serviceAccount.private_key,
    client_email: !!serviceAccount.client_email
  });
  console.warn('⚠️ Firebase will not be available - please configure environment variables');
}

export const db = isFirebaseInitialized && app ? getFirestore(app) : null;
export const storage = isFirebaseInitialized && app ? getStorage(app) : null;
export { isFirebaseInitialized };

export default app;
