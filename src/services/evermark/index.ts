// src/services/evermark/index.ts
import { contractService } from '../blockchain/contracts';
import { ipfsService } from '../storage/ipfs';
import { translationService } from '../blockchain/translation';
import { CreateEvermarkInput, Evermark } from '../../types/evermark.types';
import { CONTRACT_ADDRESSES } from '../../config/constants';
import BookmarkNFTABI from '../../config/abis/BookmarkNFT.json';
import BookmarkVotingABI from '../../config/abis/BookmarkVoting.json';

class EvermarkService {
  // Cache for evermarks to avoid repeated blockchain calls
  private evermarkCache: Map<string, Evermark> = new Map();
  
  // Creation methods
  async create(input: CreateEvermarkInput): Promise<Evermark> {
    try {
      // 1. Prepare metadata
      const { contractData, fullMetadata } = translationService.prepareContractMetadata({
        ...input.manualData,
        contentType: input.contentType,
        sourceUrl: input.sourceUrl,
      });
      
      // 2. Upload metadata to IPFS
      const metadataUri = await ipfsService.uploadJSON(fullMetadata, `evermark-${Date.now()}`);
      
      // 3. Update contract data with metadata URI
      contractData.metadataURI = metadataUri;
      
      // 4. Get wallet address
      const address = await contractService.getCurrentWalletAddress();
      if (!address) {
        throw new Error('No wallet connected');
      }
      
      // 5. Mint NFT on blockchain
      const { hash, wait } = await contractService.mintEvermark(
        address,
        metadataUri,
        contractData.title,
        contractData.contentCreator
      );
      
      // 6. Wait for transaction to complete
      const receipt = await wait();
      
      // 7. Extract token ID from receipt
      let tokenId = '';
      
      // Use ethers to parse the logs
      const { ethers } = await import('ethers');
      const iface = new ethers.Interface(BookmarkNFTABI);
      
      for (const log of receipt.logs) {
        try {
          const parsedLog = iface.parseLog(log);
          
          // Look for BookmarkCreated event
          if (parsedLog && parsedLog.name === 'BookmarkCreated') {
            tokenId = parsedLog.args[0].toString(); // tokenId is the first argument
            break;
          }
          
          // Also check for Transfer event as a fallback
          if (!tokenId && parsedLog && parsedLog.name === 'Transfer') {
            tokenId = parsedLog.args[2].toString(); // tokenId is the third argument
            break;
          }
        } catch (e) {
          // Log might not be from our contract, continue
          continue;
        }
      }
      
      // Fallback if we couldn't extract tokenId
      if (!tokenId) {
        console.warn('Could not extract tokenId from receipt, using timestamp fallback');
        tokenId = Date.now().toString();
      }
      
      // 8. Create evermark object
      const evermark: Evermark = {
        id: tokenId,
        title: contractData.title,
        author: contractData.contentCreator,
        description: fullMetadata.description || null,
        userId: address,
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          ...fullMetadata,
          tokenId: tokenId,
          metadataUri: metadataUri,
          owner: address,
          transactionHash: hash,
        },
      };
      
      // 9. Cache the evermark
      this.evermarkCache.set(tokenId, evermark);
      
      // 10. Add to local storage cache as well for persistence
      this.saveToLocalCache(evermark);
      
      return evermark;
    } catch (error: any) {
      console.error('Create evermark failed:', error);
      throw new Error(`Failed to create evermark: ${error.message}`);
    }
  }
  
  // Fetching methods
  async fetch(tokenId: string): Promise<Evermark | null> {
    try {
      // 1. Check cache first
      if (this.evermarkCache.has(tokenId)) {
        return this.evermarkCache.get(tokenId)!;
      }
      
      // 2. Check local storage cache
      const cachedEvermark = this.getFromLocalCache(tokenId);
      if (cachedEvermark) {
        this.evermarkCache.set(tokenId, cachedEvermark);
        return cachedEvermark;
      }
      
      // 3. Fetch from blockchain
      const contractData = await contractService.getEvermark(tokenId);
      
      if (!contractData.exists) {
        return null;
      }
      
      // 4. Fetch metadata from IPFS if available
      let metadata = null;
      if (contractData.metadataURI) {
        try {
          metadata = await ipfsService.fetchJSON(contractData.metadataURI);
        } catch (ipfsError) {
          console.warn('Failed to fetch metadata from IPFS:', ipfsError);
          // Continue without metadata
        }
      }
      
      // 5. Create Evermark object
      const evermark = translationService.translateFromContract(
        {
          tokenId,
          title: contractData.title || 'Untitled',
          contentCreator: contractData.author || 'Unknown',
          metadataURI: contractData.metadataURI || '',
          creator: contractData.owner || '',
          createdAt: Date.now() / 1000, // Approximate since we don't have this from contract
        },
        metadata
      );
      
      // 6. Cache the evermark
      this.evermarkCache.set(tokenId, evermark);
      this.saveToLocalCache(evermark);
      
      return evermark;
    } catch (error: any) {
      console.error('Fetch evermark failed:', error);
      throw new Error(`Failed to fetch evermark: ${error.message}`);
    }
  }
  
  async list(userAddress?: string): Promise<Evermark[]> {
    try {
      // First try to get from cache (much faster)
      const cachedEvermarks = this.getAllFromLocalCache();
      
      // If user filter is applied
      if (userAddress && cachedEvermarks.length > 0) {
        return cachedEvermarks.filter(e => e.userId?.toLowerCase() === userAddress.toLowerCase());
      }
      
      // If we have cached evermarks and no specific filter, return them
      if (cachedEvermarks.length > 0 && !userAddress) {
        return cachedEvermarks;
      }
      
      // Otherwise, we need to query the blockchain
      // This is a basic implementation - in a full app, you'd need pagination and event indexing
      
      // For user-specific evermarks, we can try to get tokens owned by address
      if (userAddress) {
        const tokenIds = await contractService.getUserEvermarks(userAddress);
        
        // Fetch each evermark
        const evermarks: Evermark[] = [];
        for (const tokenId of tokenIds) {
          try {
            const evermark = await this.fetch(tokenId);
            if (evermark) {
              evermarks.push(evermark);
            }
          } catch (error) {
            console.warn(`Failed to fetch evermark ${tokenId}:`, error);
            continue;
          }
        }
        
        return evermarks;
      }
      
      // For all evermarks, we'd ideally have an indexer
      // For now, we'll return what we have in cache
      return cachedEvermarks;
    } catch (error: any) {
      console.error('List evermarks failed:', error);
      throw new Error(`Failed to list evermarks: ${error.message}`);
    }
  }
  
  // Voting methods
  async vote(evermarkId: string, amount: string) {
    return contractService.delegateVotes(evermarkId, amount);
  }
  
  async getVotes(evermarkId: string): Promise<bigint> {
    try {
      const votingContract = contractService.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
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
  
  // Local storage cache methods
  private saveToLocalCache(evermark: Evermark): void {
    try {
      // Get existing evermarks
      const evermarksJson = localStorage.getItem('evermarks_cache');
      const evermarks: Evermark[] = evermarksJson ? JSON.parse(evermarksJson) : [];
      
      // Check if this evermark already exists
      const index = evermarks.findIndex(e => e.id === evermark.id);
      
      if (index >= 0) {
        // Update existing
        evermarks[index] = evermark;
      } else {
        // Add new
        evermarks.push(evermark);
      }
      
      // Save back to localStorage
      localStorage.setItem('evermarks_cache', JSON.stringify(evermarks));
    } catch (error) {
      console.error('Failed to save evermark to local cache:', error);
    }
  }
  
  private getFromLocalCache(tokenId: string): Evermark | null {
    try {
      const evermarksJson = localStorage.getItem('evermarks_cache');
      if (!evermarksJson) return null;
      
      const evermarks: Evermark[] = JSON.parse(evermarksJson);
      return evermarks.find(e => e.id === tokenId) || null;
    } catch (error) {
      console.error('Failed to get evermark from local cache:', error);
      return null;
    }
  }
  
  private getAllFromLocalCache(): Evermark[] {
    try {
      const evermarksJson = localStorage.getItem('evermarks_cache');
      if (!evermarksJson) return [];
      
      return JSON.parse(evermarksJson);
    } catch (error) {
      console.error('Failed to get all evermarks from local cache:', error);
      return [];
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
  
  // Search methods (now using local cache)
  async search(query: string, filters?: any): Promise<Evermark[]> {
    try {
      // Get all evermarks from cache
      const allEvermarks = this.getAllFromLocalCache();
      
      // If no query, return all
      if (!query) return allEvermarks;
      
      // Simple search implementation
      const lowerQuery = query.toLowerCase();
      return allEvermarks.filter(evermark => 
        evermark.title.toLowerCase().includes(lowerQuery) ||
        evermark.author.toLowerCase().includes(lowerQuery) ||
        evermark.description?.toLowerCase().includes(lowerQuery) ||
        evermark.metadata?.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    } catch (error: any) {
      throw new Error(`Search failed: ${error.message}`);
    }
  }
}

export const evermarkService = new EvermarkService();