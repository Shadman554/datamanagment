import { createFallbackAdmin } from './create-admin.js';
import bcrypt from 'bcrypt';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq } from 'drizzle-orm';

// Try to import schema, fallback if not available
let users;
try {
  const schema = await import('./shared/schema.js');
  users = schema.users;
} catch (error) {
  console.log('⚠️ Could not import schema, using fallback admin creation');
  const admin = await createFallbackAdmin();
  console.log('✅ Fallback super admin created successfully');
  console.log('Username:', admin.username);
  console.log('Password: SuperAdmin123!');
  process.exit(0);
}

async function createSuperAdmin() {
  try {
    // Check if we have a database connection
    if (!process.env.DATABASE_URL) {
      console.log('No DATABASE_URL found, using fallback admin creation');
      const admin = await createFallbackAdmin();
      console.log('✅ Fallback super admin created successfully');
      console.log('Username:', admin.username);
      console.log('Password: SuperAdmin123!');
      return;
    }

    // Try to connect to PostgreSQL
    const client = postgres(process.env.DATABASE_URL, {
      max: 1,
      connect_timeout: 10,
      idle_timeout: 20,
    });
    
    const db = drizzle(client);

    // Check if super admin already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.username, 'superadmin'))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log('✅ Super admin already exists');
      await client.end();
      return;
    }

    // Create super admin
    const hashedPassword = await bcrypt.hash('SuperAdmin123!', 12);
    
    await db.insert(users).values({
      username: 'superadmin',
      email: 'admin@vet-dict.com',
      password: hashedPassword,
      role: 'super_admin',
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
    });

    console.log('✅ Super admin created successfully in PostgreSQL');
    console.log('Username: superadmin');
    console.log('Password: SuperAdmin123!');
    
    await client.end();

  } catch (error) {
    console.error('❌ Failed to create super admin in PostgreSQL:', error.message);
    console.log('🔄 Falling back to in-memory admin creation');
    
    // Fallback to in-memory admin
    const admin = await createFallbackAdmin();
    console.log('✅ Fallback super admin created successfully');
    console.log('Username:', admin.username);
    console.log('Password: SuperAdmin123!');
  }
}

// Run the function
createSuperAdmin().catch(console.error);
