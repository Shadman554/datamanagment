import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Force load environment variables
import { config } from 'dotenv';
config();

// Check if we have a proper DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;
console.log('DATABASE_URL loaded:', databaseUrl ? 'Yes' : 'No');

let client: postgres.Sql | null = null;
let db: any = null;

async function initializeDatabase() {
  if (!databaseUrl) {
    console.warn("No DATABASE_URL found, admin features will be limited");
    client = null;
    db = null;
    return;
  }

  console.log("Connecting to PostgreSQL database:", databaseUrl.replace(/\/\/.*@/, "//***@"));
  
  try {
    // Create PostgreSQL connection with Railway-optimized settings
    client = postgres(databaseUrl, {
      ssl: 'require',
      max: 2,           // Very small pool for Railway free tier
      idle_timeout: 10, // Close idle connections very quickly
      connect_timeout: 15, // Longer connect timeout
      max_lifetime: 60 * 10, // 10 minutes max lifetime
      prepare: false,   // Disable prepared statements for Railway
      transform: {
        undefined: null // Handle undefined values
      },
      onnotice: () => {}, // Suppress notices
      debug: false,     // Disable debug logging
      connection: {
        application_name: 'datamanagement_app'
      }
    });
    
    db = drizzle(client, { schema });
    
    // Test the connection with a simple query
    await client`SELECT 1 as test`;
    console.log("PostgreSQL database connected successfully");
    
    // Set up connection health monitoring
    setInterval(async () => {
      try {
        if (client) {
          await client`SELECT 1`;
        }
      } catch (error) {
        console.warn('Database health check failed, reinitializing...');
        await initializeDatabase();
      }
    }, 60000); // Check every minute
    
  } catch (error) {
    console.error("Failed to connect to PostgreSQL database:", error);
    client = null;
    db = null;
    
    // Retry connection after a delay
    setTimeout(() => {
      console.log('Retrying database connection...');
      initializeDatabase();
    }, 5000);
  }
}

// Initialize database connection
if (databaseUrl) {
  initializeDatabase().catch(console.error);
}

export { client, db };
