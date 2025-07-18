// Using Railway API for data storage
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

export class RailwayAPIStorage implements IStorage {
  private baseURL = 'https://python-database-production.up.railway.app';
  private authToken: string | null = null;

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Handle specific error cases more gracefully
      if (response.status === 404) {
        console.warn(`API endpoint not found: ${endpoint}`);
        return { items: [] }; // Return empty items for missing endpoints
      }
      
      if (response.status === 500) {
        console.error(`Server error for ${endpoint}, returning empty result`);
        return { items: [] }; // Return empty items for server errors
      }
      
      const error = await response.text();
      throw new Error(`API request failed (${response.status}): ${error}`);
    }

    // Handle empty responses
    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // Map our collection names to API endpoints
  private getAPIEndpoint(collectionName: CollectionName): string {
    const mapping = {
      'books': '/api/books',
      'words': '/api/dictionary',
      'diseases': '/api/diseases',
      'drugs': '/api/drugs',
      'tutorialVideos': '/api/tutorial-videos',
      'staff': '/api/staff',
      'questions': '/api/questions',
      'notifications': '/api/notifications',
      'users': '/api/users',
      'normalRanges': '/api/normal-ranges',
      'appLinks': '/api/app-links'
    };
    return mapping[collectionName] || `/api/${collectionName}`;
  }

  // Check if endpoint exists and handle missing endpoints gracefully
  private async isEndpointAvailable(endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'HEAD',
        headers: this.authToken ? { 'Authorization': `Bearer ${this.authToken}` } : {}
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  // Fetch all items with pagination support
  private async getAllItems<T>(endpoint: string): Promise<T[]> {
    try {
      const allItems: T[] = [];
      
      // The API has a maximum limit of 100 items per request
      const maxLimit = 100;
      
      // First, get the first page of items with proper limit
      let response = await this.makeRequest(`${endpoint}?limit=${maxLimit}`);
      
      if (response && response.items) {
        const initialItems = response.items;
        allItems.push(...initialItems);
        
        console.log(`Fetched ${initialItems.length} items from first page of ${endpoint}`);
        
        // If we got exactly 100 items, there might be more pages
        if (initialItems.length === maxLimit) {
          console.log(`Got exactly ${maxLimit} items from ${endpoint}, fetching additional pages...`);
          
          // Use skip-based pagination (this works correctly with Railway API)
          let skip = maxLimit;
          let pageNumber = 2;
          
          while (true) {
            try {
              const url = `${endpoint}?skip=${skip}&limit=${maxLimit}`;
              const paginatedResponse = await this.makeRequest(url);
              
              let items: T[] = [];
              if (paginatedResponse && paginatedResponse.items) {
                items = paginatedResponse.items;
              } else if (Array.isArray(paginatedResponse)) {
                items = paginatedResponse;
              }
              
              if (items.length === 0) break;
              
              // No duplicate checking - let the API tell us when we've reached the end
              
              allItems.push(...items);
              skip += maxLimit;
              pageNumber++;
              
              console.log(`Page ${pageNumber - 1}: fetched ${items.length} more items from ${endpoint} (total: ${allItems.length})`);
              
              // If we got less than maxLimit items, we've reached the end
              if (items.length < maxLimit) break;
              
              // Safety limit to prevent infinite loops - for 2444 items, we need at least 25 pages
              if (skip > 5000) {
                console.log(`Reached safety limit at skip ${skip}, stopping pagination`);
                break;
              }
            } catch (error) {
              console.log(`Pagination failed at skip ${skip}:`, error);
              break;
            }
          }
          
          console.log(`Successfully fetched ${allItems.length} items from ${endpoint} using skip-based pagination`);
        }
        
        return allItems;
      } else if (Array.isArray(response)) {
        return response as T[];
      } else {
        console.warn(`Unexpected response format for ${endpoint}:`, response);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching all items from ${endpoint}:`, error);
      
      // If the initial request failed, try without pagination parameters
      try {
        const fallbackResponse = await this.makeRequest(endpoint);
        if (fallbackResponse && fallbackResponse.items) {
          return fallbackResponse.items as T[];
        } else if (Array.isArray(fallbackResponse)) {
          return fallbackResponse as T[];
        }
      } catch (fallbackError) {
        console.error(`Fallback request also failed for ${endpoint}:`, fallbackError);
      }
      
      return [];
    }
  }

  async getCollection<T>(collectionName: CollectionName): Promise<T[]> {
    try {
      const endpoint = this.getAPIEndpoint(collectionName);
      
      // Use the new pagination support to get all items
      const allItems = await this.getAllItems<T>(endpoint);
      
      console.log(`Fetched ${allItems.length} items from ${collectionName}`);
      return allItems;
    } catch (error) {
      console.error(`Error getting ${collectionName}:`, error);
      return [];
    }
  }

  async getDocument<T>(collectionName: CollectionName, id: string): Promise<T | null> {
    try {
      const endpoint = this.getAPIEndpoint(collectionName);
      
      // For dictionary/words, the API uses name-based endpoints, not ID-based
      if (collectionName === 'words') {
        // Try to find the word by ID first from the collection
        const allWords = await this.getCollection<T>(collectionName);
        const word = allWords.find((item: any) => item.id === id);
        if (word) {
          // Use the word name for the API call
          const wordName = (word as any).name;
          return await this.makeRequest(`${endpoint}/${encodeURIComponent(wordName)}`);
        }
        return null;
      }
      
      return await this.makeRequest(`${endpoint}/${id}`);
    } catch (error) {
      console.error(`Error getting document ${id} from ${collectionName}:`, error);
      return null;
    }
  }

  async createDocument<T>(collectionName: CollectionName, data: any): Promise<T> {
    try {
      const endpoint = this.getAPIEndpoint(collectionName);
      return await this.makeRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  async updateDocument<T>(collectionName: CollectionName, id: string, data: any): Promise<T> {
    try {
      const endpoint = this.getAPIEndpoint(collectionName);
      
      // For dictionary/words, the API uses name-based endpoints, not ID-based
      if (collectionName === 'words') {
        // Try to find the word by ID first from the collection
        const allWords = await this.getCollection<T>(collectionName);
        const word = allWords.find((item: any) => item.id === id);
        if (word) {
          // Use the word name for the API call
          const wordName = (word as any).name;
          return await this.makeRequest(`${endpoint}/${encodeURIComponent(wordName)}`, {
            method: 'PUT',
            body: JSON.stringify(data),
          });
        }
        throw new Error(`Word with ID ${id} not found`);
      }
      
      return await this.makeRequest(`${endpoint}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error(`Error updating document ${id} in ${collectionName}:`, error);
      throw error;
    }
  }

  async deleteDocument(collectionName: CollectionName, id: string): Promise<void> {
    try {
      const endpoint = this.getAPIEndpoint(collectionName);
      
      // For dictionary/words, the API uses name-based endpoints, not ID-based
      if (collectionName === 'words') {
        // Try to find the word by ID first from the collection
        const allWords = await this.getCollection<any>(collectionName);
        const word = allWords.find((item: any) => item.id === id);
        if (word) {
          // Use the word name for the API call
          const wordName = (word as any).name;
          await this.makeRequest(`${endpoint}/${encodeURIComponent(wordName)}`, {
            method: 'DELETE',
          });
          return;
        }
        throw new Error(`Word with ID ${id} not found`);
      }
      
      await this.makeRequest(`${endpoint}/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error(`Error deleting document ${id} from ${collectionName}:`, error);
      throw error;
    }
  }

  async searchCollection<T>(collectionName: CollectionName, query: string, field?: string): Promise<T[]> {
    try {
      // Check if endpoint exists first
      const endpoint = this.getAPIEndpoint(collectionName);
      const available = await this.isEndpointAvailable(endpoint);
      
      if (!available) {
        console.warn(`Endpoint ${endpoint} not available, returning empty array`);
        return [];
      }
      
      // Get all documents first, then filter client-side
      // The Railway API doesn't seem to have built-in search functionality
      const allDocuments = await this.getCollection<T>(collectionName);
      
      if (!query) return allDocuments;
      
      return allDocuments.filter((item: any) => {
        if (field && item[field]) {
          return item[field].toLowerCase().includes(query.toLowerCase());
        }
        
        // Search across multiple fields if no specific field provided
        const searchText = JSON.stringify(item).toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
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

export const storage = new RailwayAPIStorage();
