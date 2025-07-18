import { eq } from 'drizzle-orm';
import { db } from './db';
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
      throw new Error('Database connection not available');
    }
    return db;
  }

  private getTable(collectionName: CollectionName) {
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
    try {
      const database = await this.ensureDatabase();
      const table = this.getTable(collectionName);
      
      if (!table) {
        console.error(`Unknown collection: ${collectionName}`);
        return [];
      }

      const result = await database.select().from(table);
      console.log(`Fetched ${result.length} items from PostgreSQL ${collectionName}`);
      return result as T[];
    } catch (error) {
      console.error(`Error fetching ${collectionName} from PostgreSQL:`, error);
      return [];
    }
  }

  async getDocument<T>(collectionName: CollectionName, id: string): Promise<T | null> {
    try {
      const database = await this.ensureDatabase();
      const table = this.getTable(collectionName);
      
      if (!table) {
        console.error(`Unknown collection: ${collectionName}`);
        return null;
      }

      const result = await database.select().from(table).where(eq(table.id, id)).limit(1);
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
      const result = await database.update(table).set(updateData).where(eq(table.id, id)).returning();
      
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

      const result = await database.delete(table).where(eq(table.id, id)).returning();
      
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
}