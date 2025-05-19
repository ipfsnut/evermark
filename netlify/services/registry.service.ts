// netlify/services/registry.service.ts

import { ipfsService } from './ipfs.service';
import { RegistryIndex } from '../types/ipfs.types';
const fetch = require('node-fetch');

class RegistryService {
  private registryHash: string | null = null;
  private registry: RegistryIndex | null = null;
  
  async getRegistry(): Promise<RegistryIndex> {
    if (this.registry) {
      return this.registry;
    }
    
    return this.initialize();
  }
  
  async initialize(): Promise<RegistryIndex> {
    try {
      // For server-side, we need the full URL including the domain
      const url = process.env.URL 
        ? `${process.env.URL}/.netlify/functions/ipfs-index-pointer`
        : '/.netlify/functions/ipfs-index-pointer';

      // Try to fetch registry pointer from Netlify function
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        // Create a new registry if none exists
        return this.createNewRegistry();
      }
      
      this.registryHash = data.indexHash;
      this.registry = await ipfsService.fetchJSON<RegistryIndex>(`ipfs://${data.indexHash}`);
      return this.registry;
    } catch (error) {
      console.error('Failed to initialize registry:', error);
      return this.createNewRegistry();
    }
  }
  
  private async createNewRegistry(): Promise<RegistryIndex> {
    const newRegistry: RegistryIndex = {
      version: '1.0.0',
      updatedAt: Date.now(),
      weeklyIndexes: {}
    };
    
    // Upload to IPFS
    const hash = await ipfsService.uploadJSON(newRegistry, 'evermark-registry');
    
    // For server-side, we need the full URL including the domain
    const url = process.env.URL 
      ? `${process.env.URL}/.netlify/functions/ipfs-index-pointer`
      : '/.netlify/functions/ipfs-index-pointer';

    // Update pointer via Netlify function
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        indexHash: hash.replace('ipfs://', ''),
        cycleId: 'registry' 
      })
    });
    
    this.registryHash = hash.replace('ipfs://', '');
    this.registry = newRegistry;
    return newRegistry;
  }
  
  async updateRegistry(updates: Partial<RegistryIndex>): Promise<string> {
    const registry = await this.getRegistry();
    
    // Merge updates with existing registry
    const updatedRegistry: RegistryIndex = {
      ...registry,
      updatedAt: Date.now(),
      weeklyIndexes: {
        ...registry.weeklyIndexes,
        ...(updates.weeklyIndexes || {})
      }
    };
    
    // Upload updated registry to IPFS
    const hash = await ipfsService.uploadJSON(updatedRegistry, 'evermark-registry');
    
    // For server-side, we need the full URL including the domain
    const url = process.env.URL 
      ? `${process.env.URL}/.netlify/functions/ipfs-index-pointer`
      : '/.netlify/functions/ipfs-index-pointer';

    // Update pointer via Netlify function
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        indexHash: hash.replace('ipfs://', ''),
        cycleId: 'registry'
      })
    });
    
    this.registryHash = hash.replace('ipfs://', '');
    this.registry = updatedRegistry;
    
    return hash;
  }
}

export const registryService = new RegistryService();