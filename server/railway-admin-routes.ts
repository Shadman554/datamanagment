import type { Express } from "express";
import { RailwayAuth } from './railway-auth';

export function registerRailwayAdminRoutes(app: Express) {
  // Railway Admin Login - directly using Railway API
  app.post("/api/railway-admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const authResult = await RailwayAuth.verifyAdminCredentials(username, password);
      
      if (authResult.success) {
        // Set secure cookie with Railway token
        res.cookie("railwayToken", authResult.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 2 * 60 * 60 * 1000, // 2 hours
        });

        res.json({
          success: true,
          message: 'Login successful',
          admin: {
            username,
            email: `${username}@vet-dict.com`,
            role: 'admin',
            source: 'railway_api'
          }
        });
      } else {
        res.status(401).json({ error: authResult.error || 'Invalid credentials' });
      }
    } catch (error) {
      console.error("Railway admin login error:", error);
      res.status(500).json({ error: 'Server error during login' });
    }
  });

  // Railway Admin Logout
  app.post("/api/railway-admin/logout", async (req, res) => {
    res.clearCookie("railwayToken");
    res.json({ message: "Logged out successfully" });
  });

  // Get current Railway admin info
  app.get("/api/railway-admin/profile", async (req, res) => {
    const token = req.cookies?.railwayToken;
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    try {
      // Verify token by making a request to Railway API
      const response = await fetch('https://python-database-production.up.railway.app/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userInfo = await response.json();
        res.json({
          admin: {
            username: userInfo.username || 'admin',
            email: userInfo.email || 'admin@vet-dict.com',
            role: 'admin',
            source: 'railway_api'
          }
        });
      } else {
        res.status(401).json({ error: 'Invalid or expired token' });
      }
    } catch (error) {
      console.error("Error verifying Railway token:", error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Middleware to authenticate Railway admin requests
  const authenticateRailwayAdmin = async (req: any, res: any, next: any) => {
    const token = req.cookies?.railwayToken;
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    try {
      // Verify token with Railway API
      const response = await fetch('https://python-database-production.up.railway.app/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        req.railwayToken = token;
        req.admin = {
          username: 'admin',
          role: 'admin',
          source: 'railway_api'
        };
        next();
      } else {
        res.status(401).json({ error: 'Invalid or expired token' });
      }
    } catch (error) {
      console.error("Error verifying Railway token:", error);
      res.status(500).json({ error: 'Authentication error' });
    }
  };

  // Protected route for Railway admin operations
  app.get("/api/railway-admin/collections/:collection", authenticateRailwayAdmin, async (req: any, res) => {
    try {
      const { collection } = req.params;
      const token = req.railwayToken;

      // Map collection names to Railway API endpoints
      const endpointMap: Record<string, string> = {
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

      const endpoint = endpointMap[collection];
      if (!endpoint) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      // Make authenticated request to Railway API
      const response = await fetch(`https://python-database-production.up.railway.app${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        res.json(data);
      } else {
        const errorText = await response.text();
        res.status(response.status).json({ error: errorText });
      }
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Create new item in collection
  app.post("/api/railway-admin/collections/:collection", authenticateRailwayAdmin, async (req: any, res) => {
    try {
      const { collection } = req.params;
      const token = req.railwayToken;
      const data = req.body;

      const endpointMap: Record<string, string> = {
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

      const endpoint = endpointMap[collection];
      if (!endpoint) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      const response = await fetch(`https://python-database-production.up.railway.app${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        res.json(result);
      } else {
        const errorText = await response.text();
        res.status(response.status).json({ error: errorText });
      }
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Update item in collection
  app.put("/api/railway-admin/collections/:collection/:id", authenticateRailwayAdmin, async (req: any, res) => {
    try {
      const { collection, id } = req.params;
      const token = req.railwayToken;
      const data = req.body;

      const endpointMap: Record<string, string> = {
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

      const endpoint = endpointMap[collection];
      if (!endpoint) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      const response = await fetch(`https://python-database-production.up.railway.app${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        res.json(result);
      } else {
        const errorText = await response.text();
        res.status(response.status).json({ error: errorText });
      }
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Delete item from collection
  app.delete("/api/railway-admin/collections/:collection/:id", authenticateRailwayAdmin, async (req: any, res) => {
    try {
      const { collection, id } = req.params;
      const token = req.railwayToken;

      const endpointMap: Record<string, string> = {
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

      const endpoint = endpointMap[collection];
      if (!endpoint) {
        return res.status(404).json({ error: 'Collection not found' });
      }

      const response = await fetch(`https://python-database-production.up.railway.app${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        res.json({ message: 'Item deleted successfully' });
      } else {
        const errorText = await response.text();
        res.status(response.status).json({ error: errorText });
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ error: 'Server error' });
    }
  });
}