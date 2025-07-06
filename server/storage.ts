// Using Firebase-only storage, removed fallback storage import
import type { 
  Book, Word, Disease, Drug, TutorialVideo, Staff, Question, 
  Notification, User, NormalRange, AppLink,
  InsertBook, InsertWord, InsertDisease, InsertDrug, InsertTutorialVideo, 
  InsertStaff, InsertQuestion, InsertNotification, InsertUser, 
  InsertNormalRange, InsertAppLink, CollectionName 
} from '@shared/schema';

export interface IStorage {
  // Generic CRUD operations
  getCollection<T>(collectionName: CollectionName): Promise<T[]>;
  getDocument<T>(collectionName: CollectionName, id: string): Promise<T | null>;
  createDocument<T>(collectionName: CollectionName, data: any): Promise<T>;
  updateDocument<T>(collectionName: CollectionName, id: string, data: any): Promise<T>;
  deleteDocument(collectionName: CollectionName, id: string): Promise<void>;
  
  // Search and filter
  searchCollection<T>(collectionName: CollectionName, query: string, field?: string): Promise<T[]>;
  
  // Specific collection methods
  getBooks(): Promise<Book[]>;
  getWords(): Promise<Word[]>;
  getDiseases(): Promise<Disease[]>;
  getDrugs(): Promise<Drug[]>;
  getTutorialVideos(): Promise<TutorialVideo[]>;
  getStaff(): Promise<Staff[]>;
  getQuestions(): Promise<Question[]>;
  getNotifications(): Promise<Notification[]>;
  getUsers(): Promise<User[]>;
  getNormalRanges(): Promise<NormalRange[]>;
  getAppLinks(): Promise<AppLink[]>;
  
  createBook(book: InsertBook): Promise<Book>;
  createWord(word: InsertWord): Promise<Word>;
  createDisease(disease: InsertDisease): Promise<Disease>;
  createDrug(drug: InsertDrug): Promise<Drug>;
  createTutorialVideo(video: InsertTutorialVideo): Promise<TutorialVideo>;
  createStaff(staff: InsertStaff): Promise<Staff>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  createUser(user: InsertUser): Promise<User>;
  createNormalRange(range: InsertNormalRange): Promise<NormalRange>;
  createAppLink(link: InsertAppLink): Promise<AppLink>;
}

export class FirebaseStorage implements IStorage {
  private db: any = null;
  
  private async initializeFirebase() {
    if (!this.db) {
      try {
        const { db, isFirebaseInitialized } = await import('./firebase');
        if (!isFirebaseInitialized || !db) {
          throw new Error('Firebase is not properly configured');
        }
        this.db = db;
      } catch (error) {
        console.error('Failed to initialize Firebase:', error);
        throw error;
      }
    }
  }

  private generateId(): string {
    return Date.now().toString();
  }

  private getExportedAt(): string {
    return new Date().toISOString();
  }

  async getCollection<T>(collectionName: CollectionName): Promise<T[]> {
    try {
      await this.initializeFirebase();
      const snapshot = await this.db.collection(collectionName).get();
      return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      console.warn(`Returning empty array for ${collectionName} - Firebase not configured`);
      return [];
    }
  }

  async getDocument<T>(collectionName: CollectionName, id: string): Promise<T | null> {
    try {
      await this.initializeFirebase();
      const doc = await this.db.collection(collectionName).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() } as T;
    } catch (error) {
      console.error(`Error getting document ${id} from ${collectionName}:`, error);
      console.warn(`Returning null for document ${id} - Firebase not configured`);
      return null;
    }
  }

  async createDocument<T>(collectionName: CollectionName, data: any): Promise<T> {
    try {
      await this.initializeFirebase();
      const id = this.generateId();
      const docData = {
        ...data,
        id,
        _exportedAt: this.getExportedAt(),
      };
      
      await this.db.collection(collectionName).doc(id).set(docData);
      return docData as T;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw new Error(`Failed to create document - Firebase not configured`);
    }
  }

  async updateDocument<T>(collectionName: CollectionName, id: string, data: any): Promise<T> {
    try {
      await this.initializeFirebase();
      const updateData = {
        ...data,
        _exportedAt: this.getExportedAt(),
      };
      
      await this.db.collection(collectionName).doc(id).update(updateData);
      
      const updatedDoc = await this.getDocument<T>(collectionName, id);
      return updatedDoc as T;
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      throw error;
    }
  }

  async deleteDocument(collectionName: CollectionName, id: string): Promise<void> {
    try {
      await this.initializeFirebase();
      await this.db.collection(collectionName).doc(id).delete();
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  }

  async searchCollection<T>(collectionName: CollectionName, query: string, field?: string): Promise<T[]> {
    try {
      await this.initializeFirebase();
      let dbQuery = this.db.collection(collectionName);
      
      if (field) {
        dbQuery = dbQuery.where(field, '>=', query).where(field, '<=', query + '\uf8ff');
      }
      
      const snapshot = await dbQuery.get();
      const results = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as T));
      
      // If no field specified, search across multiple fields
      if (!field && query) {
        return results.filter((item: any) => {
          const searchText = JSON.stringify(item).toLowerCase();
          return searchText.includes(query.toLowerCase());
        });
      }
      
      return results;
    } catch (error) {
      console.error(`Error searching ${collectionName}:`, error);
      throw error;
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

  async createBook(book: InsertBook): Promise<Book> {
    return this.createDocument<Book>('books', book);
  }

  async createWord(word: InsertWord): Promise<Word> {
    return this.createDocument<Word>('words', word);
  }

  async createDisease(disease: InsertDisease): Promise<Disease> {
    return this.createDocument<Disease>('diseases', disease);
  }

  async createDrug(drug: InsertDrug): Promise<Drug> {
    return this.createDocument<Drug>('drugs', drug);
  }

  async createTutorialVideo(video: InsertTutorialVideo): Promise<TutorialVideo> {
    return this.createDocument<TutorialVideo>('tutorialVideos', video);
  }

  async createStaff(staff: InsertStaff): Promise<Staff> {
    return this.createDocument<Staff>('staff', staff);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    return this.createDocument<Question>('questions', question);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    return this.createDocument<Notification>('notifications', notification);
  }

  async createUser(user: InsertUser): Promise<User> {
    return this.createDocument<User>('users', user);
  }

  async createNormalRange(range: InsertNormalRange): Promise<NormalRange> {
    return this.createDocument<NormalRange>('normalRanges', range);
  }

  async createAppLink(link: InsertAppLink): Promise<AppLink> {
    return this.createDocument<AppLink>('appLinks', link);
  }
}

export const storage = new FirebaseStorage();
