// src/services/evermark/index.ts
import { createEvermark } from './create';
import { fetchEvermark, listEvermarks } from './fetch';
import { contractService } from '../blockchain/contracts';
import { translationService } from '../blockchain/translation';
import { CreateEvermarkInput, Evermark } from '../../types/evermark.types';

class EvermarkService {
  // Creation methods
  async create(input: CreateEvermarkInput): Promise<Evermark> {
    return createEvermark(input);
  }
  
  // Fetching methods
  async fetch(tokenId: string): Promise<Evermark | null> {
    return fetchEvermark(tokenId);
  }
  
  async list(userAddress?: string): Promise<Evermark[]> {
    return listEvermarks(userAddress);
  }
  
  // Voting methods
  async vote(evermarkId: string, amount: string) {
    return contractService.delegateVotes(evermarkId, amount);
  }
  
  async getVotes(evermarkId: string): Promise<bigint> {
    try {
      const votingContract = contractService['getContract'](
        process.env.VITE_BOOKMARK_VOTING_ADDRESS as string,
        [] // You'd need to import VotingABI here
      );
      
      // Translate evermarkId to bookmarkId for contract call
      const voteData = translationService.prepareVotingData(evermarkId, '0');
      
      return await contractService.callContract(
        votingContract,
        'getBookmarkVotes',
        [voteData.bookmarkId]
      );
    } catch (error: any) {
      throw new Error(`Failed to get votes: ${error.message}`);
    }
  }
  
  // Utility methods
  async exists(tokenId: string): Promise<boolean> {
    try {
      const evermark = await this.fetch(tokenId);
      return evermark !== null;
    } catch (error) {
      return false;
    }
  }
  
  async getMetadata(evermarkId: string) {
    try {
      const evermark = await this.fetch(evermarkId);
      return evermark?.metadata || null;
    } catch (error) {
      return null;
    }
  }
  
  // Search methods (using database when available)
  async search(query: string, filters?: any): Promise<Evermark[]> {
    try {
      // This would use your database search functionality
      // For now, we'll implement a simple filter on the list
      const allEvermarks = await this.list();
      
      const lowerQuery = query.toLowerCase();
      return allEvermarks.filter(evermark => 
        evermark.title.toLowerCase().includes(lowerQuery) ||
        evermark.author.toLowerCase().includes(lowerQuery) ||
        evermark.description?.toLowerCase().includes(lowerQuery)
      );
    } catch (error: any) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
}

export const evermarkService = new EvermarkService();

// Export individual functions for backward compatibility
export { createEvermark, fetchEvermark, listEvermarks };