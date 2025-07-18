import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

// Check if we have a proper DATABASE_URL
const databaseUrl = process.env.DATABASE_URL;

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
    // Create PostgreSQL connection
    client = postgres(databaseUrl, {
      ssl: 'require',
      max: 10,
      connect_timeout: 30
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
