// src/services/blockchain/EvermarkNFTService.ts

import { ethers } from 'ethers';
import { BaseContractService } from './BaseContractService';
import { CONTRACT_ADDRESSES } from '../../config/constants';
import BookmarkNFTABI from '../../config/abis/BookmarkNFT.json';  // Original contract ABI name
import { errorLogger } from '../../utils/error-logger';

// Type definitions
export interface EvermarkData {
  exists: boolean;
  tokenURI: string;
  owner: string | null;
  title: string | null;
  author: string | null;
  metadataURI: string | null;
  creationTime?: number;
}

export class EvermarkNFTService extends BaseContractService {
  /**
   * Get evermark data
   */
  async getEvermark(tokenId: string): Promise<EvermarkData> {
    try {
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI
      );
      
      try {
        const [exists, tokenURI, owner, bookmarkData] = await Promise.all([
          this.callContract<boolean>(contract, 'exists', [tokenId], {
            cache: true,
            cacheTime: 300000 // 5 minutes
          }).catch(() => false),
          this.callContract<string>(contract, 'tokenURI', [tokenId], {
            cache: true,
            cacheTime: 3600000 // 1 hour
          }).catch(() => ''),
          this.callContract<string>(contract, 'ownerOf', [tokenId], {
            cache: true,
            cacheTime: 300000 // 5 minutes
          }).catch(() => null),
          this.callContract<[string, string, string]>(contract, 'getBookmarkMetadata', [tokenId], {
            cache: true,
            cacheTime: 3600000 // 1 hour
          }).catch(() => null),
        ]);
        
        return {
          exists,
          tokenURI,
          owner,
          title: bookmarkData ? bookmarkData[0] : null,
          author: bookmarkData ? bookmarkData[1] : null,
          metadataURI: bookmarkData ? bookmarkData[2] : null,
        };
      } catch (innerError) {
        errorLogger.log('evermarkNFTService', innerError, { method: 'getEvermark:inner' });
        return {
          exists: false,
          tokenURI: '',
          owner: null,
          title: null,
          author: null,
          metadataURI: null,
        };
      }
    } catch (error) {
      errorLogger.log('evermarkNFTService', error, { method: 'getEvermark', tokenId });
      return {
        exists: false,
        tokenURI: '',
        owner: null,
        title: null,
        author: null,
        metadataURI: null,
      };
    }
  }
  
  /**
   * Mint new evermark
   */
  async mintEvermark(metadataUri: string, title: string, author: string) {
    try {
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI,
        signer
      );
      
      // Use mintBookmark from the contract
      const tx = await contract.mintBookmark(
        metadataUri,
        title,
        author // This is "contentCreator" in the contract
      );
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('evermarkNFTService', error, { method: 'mintEvermark' });
      throw new Error(`Failed to mint evermark: ${error.message}`);
    }
  }
  
  /**
   * Update evermark metadata
   */
  async updateEvermarkMetadata(tokenId: string, metadataURI: string) {
    try {
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI,
        signer
      );
      
      const tx = await contract.updateBookmarkMetadata(tokenId, metadataURI);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('evermarkNFTService', error, { method: 'updateEvermarkMetadata', tokenId });
      throw new Error(`Failed to update evermark metadata: ${error.message}`);
    }
  }
  
  /**
   * Get user's evermarks with optimized approach
   */
  async getUserEvermarks(address: string): Promise<string[]> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      // First check memory cache
      const cacheKey = `user_evermarks_${formattedAddress.toLowerCase()}`;
      const cachedItem = this.cache.get(cacheKey);
      if (cachedItem && Date.now() - cachedItem.timestamp < 300000) { // 5 min cache
        return cachedItem.value;
      }
      
      // Then check localStorage
      try {
        const storedCache = localStorage.getItem(cacheKey);
        if (storedCache) {
          const parsed = JSON.parse(storedCache);
          // Store in memory cache too
          this.cache.set(cacheKey, { value: parsed, timestamp: Date.now() });
          return parsed;
        }
      } catch (e) {
        // Invalid cache, continue
      }
      
      // Retry with fallback RPC providers
      for (let attempt = 0; attempt < this.rpcUrls.length; attempt++) {
        try {
          const contract = this.getContract(
            CONTRACT_ADDRESSES.BOOKMARK_NFT,
            BookmarkNFTABI
          );
          
          // First get balance to avoid unnecessary queries
          const balance = await this.callContract<bigint>(contract, 'balanceOf', [formattedAddress], {
            cache: true,
            cacheTime: 60000 // 1 minute
          });
          
          if (balance <= BigInt(0)) {
            // Cache empty result
            const emptyResult: string[] = [];
            this.cache.set(cacheKey, { value: emptyResult, timestamp: Date.now() });
            localStorage.setItem(cacheKey, JSON.stringify(emptyResult));
            return emptyResult;
          }
          
          // Get the latest block number to limit search range
          const latestBlock = await this.provider.getBlockNumber();
          // Start from a more recent block (roughly 3 months of blocks)
          const fromBlock = Math.max(0, latestBlock - 120000);
          
          // Create filter with limited block range
          const filter = contract.filters.Transfer(null, formattedAddress);
          const events = await contract.queryFilter(filter, fromBlock);
          
          // Extract token IDs
          const tokenIds = events
            .filter(event => 'args' in event)
            .map(event => {
              // Make sure event is properly formed
              if ('args' in event && Array.isArray(event.args) && event.args.length >= 3) {
                return event.args[2].toString();
              }
              return '';
            })
            .filter(Boolean);
          
          // Cache results
          this.cache.set(cacheKey, { value: tokenIds, timestamp: Date.now() });
          localStorage.setItem(cacheKey, JSON.stringify(tokenIds));
          
          return tokenIds;
        } catch (error) {
          errorLogger.log('evermarkNFTService', error, { 
            method: 'getUserEvermarks:inner', 
            attempt: attempt + 1 
          });
          
          // Try switching RPC provider
          await this.switchRpcProvider();
        }
      }
      
      // All attempts failed - check localStorage one more time
      try {
        const storedCache = localStorage.getItem(cacheKey);
        if (storedCache) {
          return JSON.parse(storedCache);
        }
      } catch (e) {
        // Invalid cache
      }
      
      // Last resort - return empty array
      return [];
    } catch (error) {
      errorLogger.log('evermarkNFTService', error, { method: 'getUserEvermarks', address });
      return [];
    }
  }
  
  /**
   * Get total number of evermarks
   */
  async getTotalEvermarks(): Promise<number> {
    try {
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_NFT,
        BookmarkNFTABI
      );
      
      try {
        const totalSupply = await this.callContract<bigint>(
          contract, 
          'totalSupply', 
          [], 
          { cache: true, cacheTime: 300000 } // 5 minutes
        );
        return Number(totalSupply);
      } catch (innerError) {
        errorLogger.log('evermarkNFTService', innerError, { method: 'getTotalEvermarks:inner' });
        return 0;
      }
    } catch (error) {
      errorLogger.log('evermarkNFTService', error, { method: 'getTotalEvermarks' });
      return 0;
    }
  }
}

// Export a singleton instance
export const evermarkNFTService = new EvermarkNFTService();
