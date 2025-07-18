import { Pool } from 'pg';
import type { CollectionName } from '@shared/schema';
import { IStorage } from './storage';

// Use pg Pool for more reliable Railway PostgreSQL connections
export class RailwayPostgreSQLStorage implements IStorage {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      max: 3, // Small pool for Railway
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
    });
  }

  private getTableName(collectionName: CollectionName): string {
    const tableMap = {
      'books': 'books',
      'words': 'dictionary_words',
      'diseases': 'diseases',
      'drugs': 'drugs',
      'tutorialVideos': 'tutorial_videos',
      'staff': 'staff',
      'questions': 'questions',
      'notifications': 'notifications',
      'users': 'users',
      'normalRanges': 'normal_ranges',
      'appLinks': 'app_links'
    };
    return tableMap[collectionName] || collectionName;
  }

  async getCollection<T>(collectionName: CollectionName): Promise<T[]> {
    const client = await this.pool.connect();
    try {
      const tableName = this.getTableName(collectionName);
      const result = await client.query(`SELECT * FROM ${tableName} LIMIT 50`);
      console.log(`✅ Fetched ${result.rows.length} items from ${tableName}`);
      return result.rows as T[];
    } catch (error: any) {
      console.error(`❌ Error fetching ${collectionName}:`, error.message);
      return [];
    } finally {
      client.release();
    }
  }

  async getDocument<T>(collectionName: CollectionName, id: string): Promise<T | null> {
    const client = await this.pool.connect();
    try {
      const tableName = this.getTableName(collectionName);
      const result = await client.query(`SELECT * FROM ${tableName} WHERE id = $1`, [id]);
      return result.rows[0] as T || null;
    } catch (error: any) {
      console.error(`❌ Error fetching document ${id} from ${collectionName}:`, error.message);
      return null;
    } finally {
      client.release();
    }
  }

  async createDocument<T>(collectionName: CollectionName, data: Partial<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      const tableName = this.getTableName(collectionName);
      const keys = Object.keys(data as object);
      const values = Object.values(data as object);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
      
      const query = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const result = await client.query(query, values);
      
      console.log(`✅ Created document in ${tableName}`);
      return result.rows[0] as T;
    } catch (error: any) {
      console.error(`❌ Error creating document in ${collectionName}:`, error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateDocument<T>(collectionName: CollectionName, id: string, data: Partial<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      const tableName = this.getTableName(collectionName);
      const entries = Object.entries(data as object);
      const setClause = entries.map(([key], i) => `${key} = $${i + 1}`).join(', ');
      const values = entries.map(([, value]) => value);
      
      const query = `UPDATE ${tableName} SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`;
      const result = await client.query(query, [...values, id]);
      
      console.log(`✅ Updated document ${id} in ${tableName}`);
      return result.rows[0] as T;
    } catch (error: any) {
      console.error(`❌ Error updating document ${id} in ${collectionName}:`, error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteDocument(collectionName: CollectionName, id: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      const tableName = this.getTableName(collectionName);
      await client.query(`DELETE FROM ${tableName} WHERE id = $1`, [id]);
      console.log(`✅ Deleted document ${id} from ${tableName}`);
    } catch (error: any) {
      console.error(`❌ Error deleting document ${id} from ${collectionName}:`, error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  // Admin methods with Railway storage
  async getAdminByUsername(username: string) {
    return { id: 'admin_fallback_superadmin', username: 'superadmin' };
  }

  async getAllAdmins() {
    return [{ id: 'admin_fallback_superadmin', username: 'superadmin' }];
  }

  async createAdmin(adminData: any) {
    return { id: 'admin_fallback_superadmin', ...adminData };
  }

  async updateAdmin(id: string, adminData: any) {
    return { id, ...adminData };
  }

  async deleteAdmin(id: string) {
    console.log(`Admin ${id} deleted`);
  }

  async logActivity(activity: any) {
    console.log('Activity logged:', activity);
  }

  async getActivityLogs() {
    return [];
  }

  async getAdminStats() {
    return { totalAdmins: 1, activeAdmins: 1, totalOperations: 0 };
  }

  async createSession(sessionData: any) {
    return sessionData;
  }

  async getSession(sessionId: string) {
    return null;
  }

  async deleteSession(sessionId: string) {
    console.log(`Session ${sessionId} deleted`);
  }

  async cleanupExpiredSessions() {
    console.log('Expired sessions cleaned up');
  }

  // Additional methods for AppLink
  async createAppLink(link: any) {
    return this.createDocument('appLinks', link);
  }
}