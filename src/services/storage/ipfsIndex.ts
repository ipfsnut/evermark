// src/services/storage/ipfsIndex.ts
import { ipfsService } from './ipfs';

// Types for our index structure
export interface EvermarkIndexItem {
  id: string;              // Token ID
  title: string;
  author: string;
  createdAt: number;       // Timestamp
  updatedAt: number;       // Timestamp
  owner: string;           // Current owner address
  metadataURI: string;     // IPFS URI to full metadata
  contentType: string;     // Website, Article, etc.
  tags: string[];          // Categories
  voteCount?: number;      // Optional popularity metric
}

export interface EvermarkIndex {
  // Metadata
  version: string;
  createdAt: number;
  updatedAt: number;
  indexer: string;         // Address of who created this index
  previousIndex?: string;  // IPFS hash of previous index (for historical chain)
  cycleId: string;         // Weekly cycle identifier (e.g., "2023-W42")
  
  // Core data
  evermarks: EvermarkIndexItem[];
  
  // Quick access lists (by ID)
  recentEvermarks: string[];
  popularEvermarks: string[];
  
  // Category mapping
  categories: {
    [category: string]: string[]; // Category name -> array of evermark IDs
  };
}

// Singleton service
class IPFSIndexService {
  private currentIndexHash: string | null = null;
  private cachedIndex: EvermarkIndex | null = null;
  private indexLoadPromise: Promise<EvermarkIndex> | null = null;
  
  /**
   * Get the current cycle ID (e.g., "2023-W42")
   */
  private getCurrentCycleId(): string {
    const now = new Date();
    const year = now.getFullYear();
    
    // Get ISO week number
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = (now.getTime() - start.getTime()) + 
                 ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    const weekNumber = Math.floor(diff / oneWeek) + 1;
    
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  }
  
  /**
   * Create an empty index
   */
  private createEmptyIndex(indexer: string): EvermarkIndex {
    const cycleId = this.getCurrentCycleId();
    return {
      version: "1.0",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      indexer,
      cycleId,
      evermarks: [],
      recentEvermarks: [],
      popularEvermarks: [],
      categories: {}
    };
  }
  
  /**
   * Get the latest index, fetching from IPFS if needed
   */
  async getLatestIndex(): Promise<EvermarkIndex> {
    // If we have a cached index, return it immediately
    if (this.cachedIndex) {
      return this.cachedIndex;
    }
    
    // If we're already loading the index, return the promise
    if (this.indexLoadPromise) {
      return this.indexLoadPromise;
    }
    
    // Start loading the index
    this.indexLoadPromise = this.fetchLatestIndex();
    
    try {
      // Wait for the index to load
      const index = await this.indexLoadPromise;
      this.cachedIndex = index;
      return index;
    } finally {
      // Clear the loading promise
      this.indexLoadPromise = null;
    }
  }
  
  /**
   * Fetch the latest index from IPFS
   */
  private async fetchLatestIndex(): Promise<EvermarkIndex> {
    try {
      // Try to get the latest index hash from the Netlify function
      const response = await fetch('/.netlify/functions/ipfs-index-pointer');
      
      if (!response.ok) {
        console.warn(`Failed to fetch latest index pointer: ${response.status}`);
        throw new Error(`Failed to fetch latest index pointer: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.indexHash) {
        console.warn('No index hash returned from server');
        throw new Error('No index hash returned from server');
      }
      
      // Store the current index hash
      this.currentIndexHash = data.indexHash;
      
      // Fetch the index from IPFS
      console.log(`Fetching index from IPFS: ${data.indexHash}`);
      const index = await ipfsService.fetchJSON<EvermarkIndex>(`ipfs://${data.indexHash}`);
      return index;
    } catch (error) {
      console.error('Failed to fetch latest index:', error);
      
      // If we can't fetch the index, create a new empty one
      // This should only happen the very first time or if there's a network issue
      const address = await this.getCurrentAddress();
      return this.createEmptyIndex(address || 'unknown');
    }
  }
  
  /**
   * Get the current user's address
   */
  private async getCurrentAddress(): Promise<string | null> {
    try {
      // This would use the actual wallet connection
      // For now, just return a placeholder
      return 'evermark-indexer';
    } catch (error) {
      console.error('Failed to get current address:', error);
      return null;
    }
  }
  
  /**
   * Add or update an evermark in the index
   */
  async addOrUpdateEvermark(evermark: EvermarkIndexItem): Promise<string> {
    // Get the current index
    const index = await this.getLatestIndex();
    
    // Check if the evermark already exists in the index
    const existingIndex = index.evermarks.findIndex(e => e.id === evermark.id);
    
    if (existingIndex >= 0) {
      // Update the existing evermark
      index.evermarks[existingIndex] = {
        ...index.evermarks[existingIndex],
        ...evermark,
        updatedAt: Date.now()
      };
    } else {
      // Add the new evermark
      index.evermarks.push({
        ...evermark,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      
      // Add to recent evermarks (at the beginning)
      index.recentEvermarks.unshift(evermark.id);
      
      // Keep only the 50 most recent
      if (index.recentEvermarks.length > 50) {
        index.recentEvermarks = index.recentEvermarks.slice(0, 50);
      }
      
      // Add to categories
      if (evermark.tags && evermark.tags.length > 0) {
        for (const tag of evermark.tags) {
          if (!index.categories[tag]) {
            index.categories[tag] = [];
          }
          
          if (!index.categories[tag].includes(evermark.id)) {
            index.categories[tag].push(evermark.id);
          }
        }
      }
    }
    
    // Update the index metadata
    index.updatedAt = Date.now();
    
    // Check if we need to start a new cycle
    const currentCycle = this.getCurrentCycleId();
    if (index.cycleId !== currentCycle) {
      // Store the previous index hash before creating a new cycle
      const previousIndexHash = this.currentIndexHash;
      
      // Create a new index for the new cycle
      const address = await this.getCurrentAddress();
      const newIndex = this.createEmptyIndex(address || 'unknown');
      
      // Link to the previous index
      if (previousIndexHash) {
        newIndex.previousIndex = previousIndexHash;
      }
      
      // Copy the recent and popular evermarks
      newIndex.recentEvermarks = [...index.recentEvermarks];
      newIndex.popularEvermarks = [...index.popularEvermarks];
      
      // Upload the index to IPFS
      return this.uploadIndex(newIndex);
    }
    
    // Upload the updated index to IPFS
    return this.uploadIndex(index);
  }
  
  /**
   * Upload an index to IPFS and update the pointer
   */
  private async uploadIndex(index: EvermarkIndex): Promise<string> {
    try {
      // Upload the index to IPFS
      const indexHash = await ipfsService.uploadJSON(
        index, 
        `evermark-index-${index.cycleId}-${Date.now()}`
      );
      
      // Extract just the hash part (remove ipfs:// prefix)
      const hash = indexHash.replace('ipfs://', '');
      
      // Update the pointer via Netlify function
      const response = await fetch('/.netlify/functions/ipfs-index-pointer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          indexHash: hash,
          cycleId: index.cycleId
        })
      });
      
      if (!response.ok) {
        console.error(`Failed to update index pointer: ${response.status}`);
        throw new Error(`Failed to update index pointer: ${response.status}`);
      }
      
      // Update the cache
      this.currentIndexHash = hash;
      this.cachedIndex = index;
      
      return hash;
    } catch (error) {
      console.error('Failed to upload index:', error);
      throw error;
    }
  }
  
  /**
   * Get recent evermarks
   */
  async getRecentEvermarks(limit: number = 10): Promise<EvermarkIndexItem[]> {
    const index = await this.getLatestIndex();
    
    // Get the IDs of recent evermarks
    const recentIds = index.recentEvermarks.slice(0, limit);
    
    // Get the full evermark data for these IDs
    return recentIds.map(id => {
      return index.evermarks.find(e => e.id === id)!;
    }).filter(Boolean);
  }
  
  /**
   * Get popular evermarks
   */
  async getPopularEvermarks(limit: number = 10): Promise<EvermarkIndexItem[]> {
    const index = await this.getLatestIndex();
    
    // If we have pre-calculated popular evermarks, use those
    if (index.popularEvermarks.length > 0) {
      const popularIds = index.popularEvermarks.slice(0, limit);
      
      return popularIds.map(id => {
        return index.evermarks.find(e => e.id === id)!;
      }).filter(Boolean);
    }
    
    // Otherwise, calculate based on vote count
    return [...index.evermarks]
      .sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0))
      .slice(0, limit);
  }
  
  /**
   * Get evermarks by category/tag
   */
  async getEvermarksByCategory(category: string, limit: number = 10): Promise<EvermarkIndexItem[]> {
    const index = await this.getLatestIndex();
    
    // Get the IDs for this category
    const categoryIds = index.categories[category] || [];
    
    // Get the full evermark data for these IDs
    return categoryIds
      .slice(0, limit)
      .map(id => {
        return index.evermarks.find(e => e.id === id)!;
      })
      .filter(Boolean);
  }
  
  /**
   * Search evermarks
   */
  async searchEvermarks(query: string, limit: number = 20): Promise<EvermarkIndexItem[]> {
    const index = await this.getLatestIndex();
    
    // Simple search implementation
    const queryLower = query.toLowerCase();
    return index.evermarks
      .filter(evermark => {
        const titleMatch = evermark.title.toLowerCase().includes(queryLower);
        const authorMatch = evermark.author.toLowerCase().includes(queryLower);
        const tagMatch = evermark.tags.some(tag => tag.toLowerCase().includes(queryLower));
        
        return titleMatch || authorMatch || tagMatch;
      })
      .slice(0, limit);
  }
}

export const ipfsIndexService = new IPFSIndexService();
