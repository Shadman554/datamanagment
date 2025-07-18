import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Force load environment variables
import { config } from 'dotenv';
config();

// Disable PostgreSQL connection - use Railway API exclusively
const databaseUrl = null; // Disable PostgreSQL connection
console.log('🚫 PostgreSQL disabled - using Railway API exclusively');

let client: postgres.Sql | null = null;
let db: any = null;

async function initializeDatabase() {
  if (!databaseUrl) {
    console.warn("No DATABASE_URL found, admin features will be limited");
    client = null;
    db = null;
    return;
  }

  console.log("🚀 Connecting to Railway PostgreSQL database:", databaseUrl.replace(/\/\/.*@/, "//***@"));
  
  try {
    // Create PostgreSQL connection with Railway-optimized settings
    client = postgres(databaseUrl, {
      ssl: { rejectUnauthorized: false }, // More flexible SSL for Railway
      max: 1,           // Single connection for stability
      idle_timeout: 5,  // Very quick cleanup
      connect_timeout: 30, // Longer connect timeout for Railway
      max_lifetime: 60 * 5, // 5 minutes max lifetime
      prepare: false,   // Disable prepared statements for Railway
      transform: {
        undefined: null // Handle undefined values
      },
      onnotice: () => {}, // Suppress notices
      debug: false,     // Disable debug logging
      connection: {
        application_name: 'vet_admin_panel'
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
