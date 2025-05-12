// src/services/storage/database.ts
import { Evermark } from '../../types/evermark.types'; // Fixed import path

// Local storage keys
const STORAGE_KEYS = {
  EVERMARKS: 'evermarks_data',
  USER_EVERMARKS: 'user_evermarks',
  USER_PROFILES: 'user_profiles',
};

class LocalDatabaseService {
  // Transform generic evermark to app evermark
  private transformEvermark(data: any): Evermark {
    return {
      id: data.id,
      title: data.title || 'Untitled',
      author: data.author || 'Unknown',
      description: data.description || null,
      userId: data.userId || data.user_id,
      verified: data.verified || false,
      createdAt: new Date(data.createdAt || data.created_at || Date.now()),
      updatedAt: new Date(data.updatedAt || data.updated_at || Date.now()),
      metadata: data.metadata,
    };
  }

  // Evermark-related operations
  async saveEvermark(evermark: Partial<Evermark> & { metadata: any }): Promise<Evermark> {
    try {
      // Generate ID if not provided
      const id = evermark.id || `evermark-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      
      // Create evermark object with proper structure
      const newEvermark: Evermark = this.transformEvermark({
        ...evermark,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Get existing evermarks
      const evermarks = this.getLocalEvermarks();
      
      // Check if evermark already exists
      const index = evermarks.findIndex(e => e.id === id);
      if (index >= 0) {
        // Update existing
        evermarks[index] = {
          ...evermarks[index],
          ...newEvermark,
          updatedAt: new Date(),
        };
      } else {
        // Add new
        evermarks.push(newEvermark);
      }
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEYS.EVERMARKS, JSON.stringify(evermarks));
      
      // Add to user's evermarks if userId is provided
      if (evermark.userId) {
        this.addToUserEvermarks(evermark.userId, id);
      }
      
      return newEvermark;
    } catch (error: any) {
      throw new Error(`Failed to save evermark: ${error.message}`);
    }
  }
  
  async getEvermark(id: string): Promise<Evermark | null> {
    try {
      const evermarks = this.getLocalEvermarks();
      const evermark = evermarks.find(e => e.id === id);
      
      return evermark || null;
    } catch (error: any) {
      throw new Error(`Failed to get evermark: ${error.message}`);
    }
  }
  
  async getEvermarksByUserId(userId: string): Promise<Evermark[]> {
    try {
      // Get user's evermark IDs
      const userEvermarks = this.getUserEvermarks(userId);
      
      // Get all evermarks
      const evermarks = this.getLocalEvermarks();
      
      // Filter by user's evermarks
      return evermarks.filter(e => userEvermarks.includes(e.id));
    } catch (error: any) {
      throw new Error(`Failed to get user evermarks: ${error.message}`);
    }
  }
  
  async getAllEvermarks(limit = 50, offset = 0): Promise<Evermark[]> {
    try {
      const evermarks = this.getLocalEvermarks();
      
      // Sort by creation date (newest first)
      evermarks.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Slice for pagination
      return evermarks.slice(offset, offset + limit);
    } catch (error: any) {
      throw new Error(`Failed to get evermarks: ${error.message}`);
    }
  }
  
  async updateEvermark(id: string, updates: Partial<Evermark>): Promise<Evermark | null> {
    try {
      const evermarks = this.getLocalEvermarks();
      const index = evermarks.findIndex(e => e.id === id);
      
      if (index === -1) {
        return null;
      }
      
      // Update evermark
      evermarks[index] = {
        ...evermarks[index],
        ...updates,
        updatedAt: new Date(),
      };
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEYS.EVERMARKS, JSON.stringify(evermarks));
      
      return evermarks[index];
    } catch (error: any) {
      throw new Error(`Failed to update evermark: ${error.message}`);
    }
  }
  
  // Helper methods for local storage
  private getLocalEvermarks(): Evermark[] {
    const data = localStorage.getItem(STORAGE_KEYS.EVERMARKS);
    return data ? JSON.parse(data) : [];
  }
  
  private getUserEvermarks(userId: string): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.USER_EVERMARKS);
    const userEvermarks = data ? JSON.parse(data) : {};
    return userEvermarks[userId] || [];
  }
  
  private addToUserEvermarks(userId: string, evermarkId: string) {
    const data = localStorage.getItem(STORAGE_KEYS.USER_EVERMARKS);
    const userEvermarks = data ? JSON.parse(data) : {};
    
    // Initialize user's evermarks if not exists
    if (!userEvermarks[userId]) {
      userEvermarks[userId] = [];
    }
    
    // Add evermark ID if not already in the list
    if (!userEvermarks[userId].includes(evermarkId)) {
      userEvermarks[userId].push(evermarkId);
    }
    
    // Save back to localStorage
    localStorage.setItem(STORAGE_KEYS.USER_EVERMARKS, JSON.stringify(userEvermarks));
  }
}

export const databaseService = new LocalDatabaseService();