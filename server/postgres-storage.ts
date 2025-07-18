import { eq } from 'drizzle-orm';
import { client, db } from './db';
import { 
  booksTable, wordsTable, diseasesTable, drugsTable, tutorialVideosTable,
  staffTable, questionsTable, notificationsTable, usersTable, 
  normalRangesTable, appLinksTable
} from '@shared/schema';
import type { 
  Book, Word, Disease, Drug, TutorialVideo, Staff, Question, 
  Notification, User, NormalRange, AppLink, CollectionName
} from '@shared/schema';
import { IStorage } from './storage';

export class PostgreSQLStorage implements IStorage {
  private async ensureDatabase() {
    if (!db) {
      throw new Error('PostgreSQL database connection not available');
    }
    return db;
  }

  private async ensureClient() {
    if (!client) {
      throw new Error('PostgreSQL database connection not available');
    }
    return client;
  }

  private getTable(collectionName: CollectionName) {
    // Map collection names to actual Drizzle table objects
    const tableMap = {
      'books': booksTable,
      'words': wordsTable,
      'diseases': diseasesTable,
      'drugs': drugsTable,
      'tutorialVideos': tutorialVideosTable,
      'staff': staffTable,
      'questions': questionsTable,
      'notifications': notificationsTable,
      'users': usersTable,
      'normalRanges': normalRangesTable,
      'appLinks': appLinksTable
    };
    return tableMap[collectionName];
  }

  async getCollection<T>(collectionName: CollectionName): Promise<T[]> {
    let retries = 3;
    while (retries > 0) {
      try {
        const database = await this.ensureDatabase();
        const table = this.getTable(collectionName);
        
        if (!table) {
          console.error(`Unknown collection: ${collectionName}`);
          return [];
        }

        // Use Drizzle ORM to query the table
        const result = await database.select().from(table).limit(100);
        console.log(`✅ Fetched ${result.length} items from PostgreSQL table ${collectionName}`);
        return result as unknown as T[];
      } catch (error: any) {
        retries--;
        console.error(`Error fetching ${collectionName} from PostgreSQL (${retries} retries left):`, error.message);
        
        if (retries === 0) {
          console.error(`❌ Failed to fetch ${collectionName} after all retries`);
          return [];
        }
        
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    return [];
  }

  async getDocument<T>(collectionName: CollectionName, id: string): Promise<T | null> {
    try {
      const database = await this.ensureDatabase();
      const table = this.getTable(collectionName);
      
      if (!table) {
        console.error(`Unknown collection: ${collectionName}`);
        return null;
      }

      const result = await database.select().from(table).where(eq((table as any).id, id)).limit(1);
      return result[0] as T || null;
    } catch (error) {
      console.error(`Error fetching document ${id} from ${collectionName}:`, error);
      return null;
    }
  }

  async createDocument<T>(collectionName: CollectionName, data: any): Promise<T> {
    try {
      const database = await this.ensureDatabase();
      const table = this.getTable(collectionName);
      
      if (!table) {
        throw new Error(`Unknown collection: ${collectionName}`);
      }

      const result = await database.insert(table).values(data).returning();
      console.log(`Created document in PostgreSQL ${collectionName}:`, result[0]);
      return result[0] as T;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  async updateDocument<T>(collectionName: CollectionName, id: string, data: any): Promise<T> {
    try {
      const database = await this.ensureDatabase();
      const table = this.getTable(collectionName);
      
      if (!table) {
        throw new Error(`Unknown collection: ${collectionName}`);
      }

      const updateData = { ...data, updatedAt: new Date() };
      const result = await database.update(table).set(updateData).where(eq((table as any).id, id)).returning();
      
      if (result.length === 0) {
        throw new Error(`Document ${id} not found in ${collectionName}`);
      }

      console.log(`Updated document in PostgreSQL ${collectionName}:`, result[0]);
      return result[0] as T;
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      throw error;
    }
  }

  async deleteDocument(collectionName: CollectionName, id: string): Promise<void> {
    try {
      const database = await this.ensureDatabase();
      const table = this.getTable(collectionName);
      
      if (!table) {
        throw new Error(`Unknown collection: ${collectionName}`);
      }

      const result = await database.delete(table).where(eq((table as any).id, id)).returning();
      
      if (result.length === 0) {
        throw new Error(`Document ${id} not found in ${collectionName}`);
      }

      console.log(`Deleted document from PostgreSQL ${collectionName}:`, id);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  }

  async searchCollection<T>(collectionName: CollectionName, query: string, field?: string): Promise<T[]> {
    try {
      const database = await this.ensureDatabase();
      const table = this.getTable(collectionName);
      
      if (!table) {
        console.error(`Unknown collection: ${collectionName}`);
        return [];
      }

      // For now, return all items since implementing proper search requires additional setup
      const result = await database.select().from(table);
      
      // Simple client-side filtering for now
      if (field && query) {
        return result.filter((item: any) => 
          item[field]?.toString().toLowerCase().includes(query.toLowerCase())
        ) as T[];
      }
      
      return result as T[];
    } catch (error) {
      console.error(`Error searching ${collectionName}:`, error);
      return [];
    }
  }

  // Specific collection methods
  async getBooks(): Promise<Book[]> {
    return this.getCollection<Book>('books');
  }

  async getWords(): Promise<Word[]> {
    return this.getCollection<Word>('words');
  }

  async getDiseases(): Promise<Disease[]> {
    return this.getCollection<Disease>('diseases');
  }

  async getDrugs(): Promise<Drug[]> {
    return this.getCollection<Drug>('drugs');
  }

  async getTutorialVideos(): Promise<TutorialVideo[]> {
    return this.getCollection<TutorialVideo>('tutorialVideos');
  }

  async getStaff(): Promise<Staff[]> {
    return this.getCollection<Staff>('staff');
  }

  async getQuestions(): Promise<Question[]> {
    return this.getCollection<Question>('questions');
  }

  async getNotifications(): Promise<Notification[]> {
    return this.getCollection<Notification>('notifications');
  }

  async getUsers(): Promise<User[]> {
    return this.getCollection<User>('users');
  }

  async getNormalRanges(): Promise<NormalRange[]> {
    return this.getCollection<NormalRange>('normalRanges');
  }

  async getAppLinks(): Promise<AppLink[]> {
    return this.getCollection<AppLink>('appLinks');
  }

  async createBook(book: any): Promise<Book> {
    return this.createDocument<Book>('books', book);
  }

  async createWord(word: any): Promise<Word> {
    return this.createDocument<Word>('words', word);
  }

  async createDisease(disease: any): Promise<Disease> {
    return this.createDocument<Disease>('diseases', disease);
  }

  async createDrug(drug: any): Promise<Drug> {
    return this.createDocument<Drug>('drugs', drug);
  }

  async createTutorialVideo(video: any): Promise<TutorialVideo> {
    return this.createDocument<TutorialVideo>('tutorialVideos', video);
  }

  async createStaff(staff: any): Promise<Staff> {
    return this.createDocument<Staff>('staff', staff);
  }

  async createQuestion(question: any): Promise<Question> {
    return this.createDocument<Question>('questions', question);
  }

  async createNotification(notification: any): Promise<Notification> {
    return this.createDocument<Notification>('notifications', notification);
  }

  async createUser(user: any): Promise<User> {
    return this.createDocument<User>('users', user);
  }

  async createNormalRange(range: any): Promise<NormalRange> {
    return this.createDocument<NormalRange>('normalRanges', range);
  }

  async createAppLink(link: any): Promise<AppLink> {
    return this.createDocument<AppLink>('appLinks', link);
  }

  // Admin methods - PostgreSQL implementations
  async getAdmins(): Promise<any[]> {
    try {
      const database = await this.ensureClient();
      const result = await database`SELECT * FROM users ORDER BY username`;
      return result;
    } catch (error) {
      console.error('Error fetching admins from PostgreSQL:', error);
      return [];
    }
  }

  async getAdminByUsername(username: string): Promise<any> {
    try {
      const database = await this.ensureClient();
      const result = await database`SELECT * FROM users WHERE username = ${username} LIMIT 1`;
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching admin by username from PostgreSQL:', error);
      return null;
    }
  }

  async getAdminById(adminId: string): Promise<any> {
    try {
      const database = await this.ensureClient();
      const result = await database`SELECT * FROM users WHERE id = ${adminId} LIMIT 1`;
      
      if (result[0]) {
        // Transform database field names to match AdminUser interface
        const user = result[0];
        return {
          id: user.id,
          username: user.username,
          email: user.email || `${user.username}@vet-dict.com`,
          password: user.password,
          role: user.role || 'admin',
          firstName: user.first_name || user.username,
          lastName: user.last_name || '',
          isActive: user.is_active, // Transform snake_case to camelCase
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          lastLoginAt: user.last_login_at
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching admin by ID from PostgreSQL:', error);
      return null;
    }
  }

  async createAdmin(adminData: any): Promise<any> {
    try {
      const database = await this.ensureClient();
      const result = await database`
        INSERT INTO admin_users (username, email, password, role, first_name, last_name, is_active)
        VALUES (${adminData.username}, ${adminData.email}, ${adminData.password}, ${adminData.role}, ${adminData.firstName}, ${adminData.lastName}, ${adminData.isActive})
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error creating admin in PostgreSQL:', error);
      return { id: 'admin_fallback_' + Date.now(), ...adminData };
    }
  }

  async updateAdmin(id: string, adminData: any): Promise<any> {
    try {
      const database = await this.ensureClient();
      const result = await database`
        UPDATE admin_users 
        SET username = ${adminData.username}, email = ${adminData.email}, 
            first_name = ${adminData.firstName}, last_name = ${adminData.lastName}, 
            is_active = ${adminData.isActive}, updated_at = NOW()
        WHERE id = ${id}
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error updating admin in PostgreSQL:', error);
      return { id, ...adminData };
    }
  }

  async deleteAdmin(id: string): Promise<void> {
    try {
      const database = await this.ensureClient();
      await database`DELETE FROM admin_users WHERE id = ${id}`;
    } catch (error) {
      console.error('Error deleting admin from PostgreSQL:', error);
    }
  }

  async logActivity(activity: any): Promise<void> {
    try {
      const database = await this.ensureClient();
      await database`
        INSERT INTO activity_logs (admin_id, action, resource_type, resource_id, details, created_at)
        VALUES (${activity.adminId}, ${activity.action}, ${activity.resourceType}, ${activity.resourceId}, ${JSON.stringify(activity.details)}, NOW())
      `;
    } catch (error) {
      console.error('Error logging activity to PostgreSQL:', error);
    }
  }

  async getActivityLogs(): Promise<any[]> {
    try {
      const database = await this.ensureClient();
      const result = await database`SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 100`;
      return result;
    } catch (error) {
      console.error('Error fetching activity logs from PostgreSQL:', error);
      return [];
    }
  }

  async getAdminStats(): Promise<any> {
    try {
      const database = await this.ensureClient();
      const totalAdmins = await database`SELECT COUNT(*) as count FROM admin_users`;
      const activeAdmins = await database`SELECT COUNT(*) as count FROM admin_users WHERE is_active = true`;
      const totalOperations = await database`SELECT COUNT(*) as count FROM activity_logs`;
      
      return {
        totalAdmins: totalAdmins[0]?.count || 0,
        activeAdmins: activeAdmins[0]?.count || 0,
        totalOperations: totalOperations[0]?.count || 0
      };
    } catch (error) {
      console.error('Error fetching admin stats from PostgreSQL:', error);
      return { totalAdmins: 1, activeAdmins: 1, totalOperations: 0 };
    }
  }

  async createSession(sessionData: any): Promise<any> {
    try {
      const database = await this.ensureClient();
      const result = await database`
        INSERT INTO admin_sessions (id, admin_id, expires_at, created_at)
        VALUES (${sessionData.id}, ${sessionData.adminId}, ${sessionData.expiresAt}, NOW())
        RETURNING *
      `;
      return result[0];
    } catch (error) {
      console.error('Error creating session in PostgreSQL:', error);
      return { id: 'session_' + Date.now(), ...sessionData };
    }
  }

  async getSession(sessionId: string): Promise<any> {
    try {
      const database = await this.ensureClient();
      const result = await database`SELECT * FROM admin_sessions WHERE id = ${sessionId} AND expires_at > NOW()`;
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching session from PostgreSQL:', error);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      const database = await this.ensureClient();
      await database`DELETE FROM admin_sessions WHERE id = ${sessionId}`;
    } catch (error) {
      console.error('Error deleting session from PostgreSQL:', error);
    }
  }

  async cleanExpiredSessions(): Promise<void> {
    try {
      const database = await this.ensureClient();
      await database`DELETE FROM admin_sessions WHERE expires_at <= NOW()`;
    } catch (error) {
      console.error('Error cleaning expired sessions from PostgreSQL:', error);
    }
  }
}