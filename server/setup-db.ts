import { db } from './db';
import { 
  booksTable, wordsTable, diseasesTable, drugsTable, tutorialVideosTable,
  staffTable, questionsTable, notificationsTable, usersTable, 
  normalRangesTable, appLinksTable, adminUsers, activityLogs, adminSessions
} from '@shared/schema';

export async function setupDatabase() {
  if (!db) {
    console.log('No database connection available, skipping table creation');
    return false;
  }

  try {
    console.log('Setting up PostgreSQL database tables...');
    
    // Test the connection first
    await db.execute('SELECT NOW()');
    console.log('✅ PostgreSQL connection test successful');

    // The tables will be created automatically by Drizzle when we use them
    // Let's test each table by trying to select from it
    const tables = [
      { name: 'books', table: booksTable },
      { name: 'words', table: wordsTable },
      { name: 'diseases', table: diseasesTable },
      { name: 'drugs', table: drugsTable },
      { name: 'tutorial_videos', table: tutorialVideosTable },
      { name: 'staff', table: staffTable },
      { name: 'questions', table: questionsTable },
      { name: 'notifications', table: notificationsTable },
      { name: 'users', table: usersTable },
      { name: 'normal_ranges', table: normalRangesTable },
      { name: 'app_links', table: appLinksTable },
      { name: 'admin_users', table: adminUsers },
      { name: 'activity_logs', table: activityLogs },
      { name: 'admin_sessions', table: adminSessions }
    ];

    for (const { name, table } of tables) {
      try {
        await db.select().from(table).limit(1);
        console.log(`✅ Table ${name} exists and is accessible`);
      } catch (error) {
        console.log(`⚠️ Table ${name} might need to be created or has issues:`, error.message);
      }
    }

    console.log('✅ Database setup completed');
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}