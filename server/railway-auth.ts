// Railway API Authentication Service
export class RailwayAuth {
  private static baseURL = 'https://python-database-production.up.railway.app';
  private static authToken: string | null = null;
  private static tokenExpiry: number | null = null;

  // Get a valid auth token for Railway API
  static async getAuthToken(): Promise<string | null> {
    // Check if we have a valid token
    if (this.authToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.authToken;
    }

    // Try to authenticate with Railway API
    return await this.authenticate();
  }

  // Authenticate with Railway API
  private static async authenticate(): Promise<string | null> {
    try {
      // Try admin credentials
      const adminCredentials = {
        username: 'admin',
        password: 'admin123'
      };

      // Try to login with admin credentials
      const loginResponse = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminCredentials),
      });

      if (loginResponse.ok) {
        const authData = await loginResponse.json();
        this.authToken = authData.access_token;
        this.tokenExpiry = Date.now() + (50 * 60 * 1000); // 50 minutes
        console.log('✓ Railway API authenticated successfully');
        return this.authToken;
      }

      // If login failed, try to register first
      console.log('Admin login failed, trying to register...');
      const registerResponse = await fetch(`${this.baseURL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123',
          email: 'admin@vet-dict.com'
        }),
      });

      if (registerResponse.ok) {
        console.log('✓ Admin user registered successfully, logging in...');
        
        // Now try to login again
        const secondLoginResponse = await fetch(`${this.baseURL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(adminCredentials),
        });

        if (secondLoginResponse.ok) {
          const authData = await secondLoginResponse.json();
          this.authToken = authData.access_token;
          this.tokenExpiry = Date.now() + (50 * 60 * 1000);
          console.log('✓ Railway API authenticated after registration');
          return this.authToken;
        }
      }

      console.warn('⚠️ Railway API authentication failed');
      return null;
    } catch (error) {
      console.error('Railway API authentication error:', error);
      return null;
    }
  }

  // Make authenticated request to Railway API
  static async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add any additional headers from options
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Railway API request failed: ${response.status} - ${errorText}`);
      
      // Handle authentication errors
      if (response.status === 401) {
        this.authToken = null;
        this.tokenExpiry = null;
        throw new Error('Authentication failed');
      }
      
      throw new Error(`API request failed (${response.status}): ${errorText}`);
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  // Create admin user in Railway API
  static async createAdminUser(userData: any): Promise<any> {
    try {
      // Register the user first
      const registerResponse = await fetch(`${this.baseURL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (registerResponse.ok) {
        return await registerResponse.json();
      } else {
        throw new Error(`Registration failed: ${await registerResponse.text()}`);
      }
    } catch (error) {
      console.error('Error creating admin user:', error);
      throw error;
    }
  }

  // Verify admin credentials
  static async verifyAdminCredentials(username: string, password: string): Promise<any> {
    try {
      const loginResponse = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (loginResponse.ok) {
        const authData = await loginResponse.json();
        return {
          success: true,
          token: authData.access_token,
          user: authData.user || { username }
        };
      } else {
        return {
          success: false,
          error: await loginResponse.text()
        };
      }
    } catch (error) {
      console.error('Error verifying admin credentials:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}