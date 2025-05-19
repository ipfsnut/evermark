// netlify/types/ipfs.types.ts

export interface RegistryIndex {
  version: string;
  updatedAt: number;
  weeklyIndexes: { [cycleId: string]: string }; // IPFS hash
  // We'll add these in future phases:
  // categoryIndexes: { [category: string]: string }; 
  // searchIndexes: { [letter: string]: string }; 
}

export interface EvermarkIndexItem {
  id: string;
  title: string;
  author: string;
  description?: string;
  contentType: string;
  metadataURI: string;
  tags: string[];
  createdAt: number;
  votes: number;
  owner: string;
}

export interface EvermarkIndex {
  version: string;
  indexType: 'weekly'; // Will add 'category' | 'search' later
  identifier: string; // cycleId for weekly indexes
  updatedAt: number;
  items: EvermarkIndexItem[];
}