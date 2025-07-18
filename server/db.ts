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
      max: 5,           // Reduced connection pool size for Railway
      idle_timeout: 20, // Close idle connections faster
      connect_timeout: 10,
      max_lifetime: 60 * 30 // 30 minutes
    });
    db = drizzle(client, { schema });
    console.log("PostgreSQL database connected successfully");
  } catch (error) {
    console.error("Failed to connect to PostgreSQL database:", error);
    client = null;
    db = null;
  }
}

// Initialize database connection
if (databaseUrl) {
  initializeDatabase().catch(console.error);
}

export { client, db };
