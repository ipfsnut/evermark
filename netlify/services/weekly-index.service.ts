// netlify/services/weekly-index.service.ts

import { ipfsService } from './ipfs.service';
import { registryService } from './registry.service';
import { EvermarkIndex, EvermarkIndexItem } from '../types/ipfs.types';
const fetch = require('node-fetch');

class WeeklyIndexService {
  private cachedIndexes: Map<string, EvermarkIndex> = new Map();
  
  async getCurrentCycleId(): Promise<string> {
    try {
      // For server-side, we need the full URL including the domain
      const url = process.env.URL 
        ? `${process.env.URL}/.netlify/functions/voting`
        : '/.netlify/functions/voting';

      // Call the voting function to get the current cycle
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch current cycle');
      }
      const data = await response.json();
      return data.currentCycle.toString();
    } catch (error) {
      console.error('Failed to get current cycle:', error);
      // Default to current week of the year as fallback
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 0);
      const diff = now.getTime() - startOfYear.getTime();
      const weekNumber = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
      return `${now.getFullYear()}-${weekNumber}`;
    }
  }
  
  async getWeeklyIndex(cycleId: string): Promise<EvermarkIndex> {
    // Check cache first
    if (this.cachedIndexes.has(`week_${cycleId}`)) {
      return this.cachedIndexes.get(`week_${cycleId}`)!;
    }
    
    // Get registry to find index hash
    const registry = await registryService.getRegistry();
    
    // If we don't have this weekly index yet, create it
    if (!registry.weeklyIndexes[cycleId]) {
      return this.createWeeklyIndex(cycleId);
    }
    
    // Otherwise fetch the existing one
    const indexHash = registry.weeklyIndexes[cycleId];
    const index = await ipfsService.fetchJSON<EvermarkIndex>(`ipfs://${indexHash}`);
    
    // Cache it
    this.cachedIndexes.set(`week_${cycleId}`, index);
    
    return index;
  }
  
  private async createWeeklyIndex(cycleId: string): Promise<EvermarkIndex> {
    // Create a new empty index
    const newIndex: EvermarkIndex = {
      version: '1.0.0',
      indexType: 'weekly',
      identifier: cycleId,
      updatedAt: Date.now(),
      items: []
    };
    
    // Upload to IPFS
    const hash = await ipfsService.uploadJSON(newIndex, `evermark-weekly-${cycleId}`);
    const cleanHash = hash.replace('ipfs://', '');
    
    // Update registry with this new weekly index
    await registryService.updateRegistry({
      weeklyIndexes: {
        [cycleId]: cleanHash
      }
    });
    
    // Cache it
    this.cachedIndexes.set(`week_${cycleId}`, newIndex);
    
    return newIndex;
  }
  
  async addToWeeklyIndex(cycleId: string, item: EvermarkIndexItem): Promise<string> {
    const index = await this.getWeeklyIndex(cycleId);
    
    // Check if item already exists
    const existingItemIndex = index.items.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      index.items[existingItemIndex] = {
        ...index.items[existingItemIndex],
        ...item,
      };
    } else {
      // Add new item
      index.items.push(item);
    }
    
    // Sort by votes (descending)
    index.items.sort((a, b) => b.votes - a.votes);
    
    // Update lastUpdated
    index.updatedAt = Date.now();
    
    // Upload updated index
    const hash = await ipfsService.uploadJSON(index, `evermark-weekly-${cycleId}`);
    const cleanHash = hash.replace('ipfs://', '');
    
    // Update registry
    await registryService.updateRegistry({
      weeklyIndexes: {
        [cycleId]: cleanHash
      }
    });
    
    // Update cache
    this.cachedIndexes.set(`week_${cycleId}`, index);
    
    return hash;
  }
}

export const weeklyIndexService = new WeeklyIndexService();