// src/hooks/useEvermarks.ts
import { useState, useEffect, useCallback } from 'react';
import { evermarkNFTService, evermarkVotingService } from '../services/blockchain';
import { useAuth } from './useAuth';
import { Evermark, CreateEvermarkInput, ContentType } from '../types/evermark.types';
import { ipfsIndexService, EvermarkIndexItem } from '../services/storage/ipfsIndex';

// Options for list function
export interface ListOptions {
  userAddress?: string;  // If specified, get only this user's evermarks
  query?: string;        // Search query
  category?: string;     // Filter by category/tag
  sortBy?: 'recent' | 'popular'; // Sort order
  limit?: number;        // Limit results
  offset?: number;       // Pagination offset
}

export function useEvermarks() {
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userEvermarks, setUserEvermarks] = useState<Evermark[]>([]);
  const [totalEvermarks, setTotalEvermarks] = useState<number>(0);
  const [selectedEvermark, setSelectedEvermark] = useState<Evermark | null>(null);
  const { user } = useAuth();

  // Helper to convert string to ContentType enum
  const stringToContentType = useCallback((contentTypeStr?: string): ContentType => {
    if (!contentTypeStr) return ContentType.WEBSITE;
    
    switch (contentTypeStr.toUpperCase()) {
      case 'ARTICLE': return ContentType.ARTICLE;
      case 'BOOK': return ContentType.BOOK;
      case 'VIDEO': return ContentType.VIDEO;
      case 'AUDIO': return ContentType.AUDIO;
      case 'WEBSITE':
      default: return ContentType.WEBSITE;
    }
  }, []);

  // Helper to convert blockchain data to UI format
  const convertToEvermark = useCallback((tokenId: string, data: any): Evermark => {
    return {
      id: tokenId,
      title: data.title || 'Untitled',
      author: data.author || 'Unknown',
      description: data.description || '',
      userId: data.owner || '',
      verified: false,
      createdAt: new Date(data.createdAt || Date.now()),
      updatedAt: new Date(data.updatedAt || Date.now()),
      metadata: {
        tokenId,
        external_url: data.metadataURI,
        type: stringToContentType(data.contentType || data.type),
        tags: data.tags || [],
        voteCount: typeof data.voteCount === 'number' ? data.voteCount : 0
      }
    };
  }, [stringToContentType]);

  // Convert index item to Evermark
  const convertIndexItemToEvermark = useCallback((item: EvermarkIndexItem): Evermark => {
    return {
      id: item.id,
      title: item.title || 'Untitled',
      author: item.author || 'Unknown',
      description: '',
      userId: item.owner || '',
      verified: false,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      metadata: {
        tokenId: item.id,
        external_url: item.metadataURI,
        type: stringToContentType(item.contentType),
        tags: item.tags || [],
        voteCount: item.voteCount || 0
      }
    };
  }, [stringToContentType]);

  // Select an evermark for detail view
  const selectEvermark = useCallback((evermark: Evermark | null) => {
    setSelectedEvermark(evermark);
  }, []);

  // List evermarks (used by HomePage)
  const list = useCallback(async (options: ListOptions = {}): Promise<Evermark[]> => {
    setLoading(true);
    
    try {
      // If a specific user address is provided, get just their evermarks
      if (options.userAddress) {
        const tokenIds = await evermarkNFTService.getUserEvermarks(options.userAddress);
        const evermarks: Evermark[] = [];
        
        for (const tokenId of tokenIds) {
          try {
            const details = await evermarkNFTService.getEvermark(tokenId);
            if (details && details.exists) {
              evermarks.push(convertToEvermark(tokenId, details));
            }
          } catch (err) {
            console.warn(`Failed to fetch evermark ${tokenId}:`, err);
          }
        }
        
        return evermarks;
      }
      
      // For global discovery, use the IPFS index
      try {
        console.log("Using IPFS index for evermark discovery", options);
        
        let indexedEvermarks: EvermarkIndexItem[] = [];
        
        // Get the right set of evermarks based on options
        if (options.category) {
          indexedEvermarks = await ipfsIndexService.getEvermarksByCategory(
            options.category,
            options.limit || 20
          );
        } else if (options.query) {
          indexedEvermarks = await ipfsIndexService.searchEvermarks(
            options.query,
            options.limit || 20
          );
        } else if (options.sortBy === 'popular') {
          indexedEvermarks = await ipfsIndexService.getPopularEvermarks(
            options.limit || 10
          );
        } else {
          // Default to recent evermarks
          indexedEvermarks = await ipfsIndexService.getRecentEvermarks(
            options.limit || 10
          );
        }
        
        // Convert to Evermark format
        return indexedEvermarks.map(convertIndexItemToEvermark);
      } catch (indexError) {
        console.error("Failed to fetch from IPFS index:", indexError);
        
        // Fall back to user's evermarks if global query fails
        const addr = user?.walletAddress;
        if (addr) {
          console.log("Falling back to user's evermarks");
          const tokenIds = await evermarkNFTService.getUserEvermarks(addr);
          const evermarks: Evermark[] = [];
          
          for (const tokenId of tokenIds) {
            try {
              const details = await evermarkNFTService.getEvermark(tokenId);
              if (details && details.exists) {
                evermarks.push(convertToEvermark(tokenId, details));
              }
            } catch (err) {
              console.warn(`Failed to fetch evermark ${tokenId}:`, err);
            }
          }
          
          return evermarks;
        }
      }
      
      // If all else fails, return an empty array
      return [];
    } catch (err: any) {
      console.error('List evermarks failed:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, convertToEvermark, convertIndexItemToEvermark]);

  // Fetch user's evermarks
  const fetchUserEvermarks = useCallback(async (address?: string) => {
    setLoading(true);
    
    try {
      const userAddress = address || (user?.walletAddress as string);
      
      if (!userAddress) {
        setUserEvermarks([]);
        return [];
      }
      
      const tokenIds = await evermarkNFTService.getUserEvermarks(userAddress);
      const evermarks = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const details = await evermarkNFTService.getEvermark(tokenId);
            return details && details.exists ? convertToEvermark(tokenId, details) : null;
          } catch (err) {
            console.warn(`Failed to fetch evermark ${tokenId}:`, err);
            return null;
          }
        })
      );
      
      const validEvermarks = evermarks.filter((e): e is Evermark => e !== null);
      setUserEvermarks(validEvermarks);
      return validEvermarks;
    } catch (err: any) {
      console.error('Failed to fetch user evermarks:', err);
      setUserEvermarks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, convertToEvermark]);

  // Fetch a single evermark
  const fetchEvermark = useCallback(async (id: string) => {
    setLoading(true);
    
    try {
      // First try to fetch from the blockchain
      try {
        const details = await evermarkNFTService.getEvermark(id);
        
        if (!details || !details.exists) {
          throw new Error('Evermark not found on blockchain');
        }
        
        const evermark = convertToEvermark(id, details);
        
        // Get votes
        try {
          const votes = await evermarkVotingService.getEvermarkVotes(id);
          if (evermark.metadata) {
            evermark.metadata.voteCount = Number(votes);
          }
        } catch (err) {
          console.warn(`Failed to fetch votes for ${id}:`, err);
        }
        
        return evermark;
      } catch (blockchainErr) {
        console.warn(`Failed to fetch evermark ${id} from blockchain:`, blockchainErr);
        
        // Try to fetch from the index instead
        try {
          const index = await ipfsIndexService.getLatestIndex();
          const indexedEvermark = index.evermarks.find(e => e.id === id);
          
          if (!indexedEvermark) {
            throw new Error('Evermark not found in index');
          }
          
          return convertIndexItemToEvermark(indexedEvermark);
        } catch (indexErr) {
          console.error(`Failed to fetch evermark ${id} from index:`, indexErr);
          throw new Error('Evermark not found');
        }
      }
    } catch (err: any) {
      console.error(`Failed to fetch evermark ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [convertToEvermark, convertIndexItemToEvermark]);

  // Create new evermark
  const createEvermark = useCallback(async (input: CreateEvermarkInput) => {
    setLoading(true);
    setCreating(true);
    setError(null);
    
    try {
      const metadataUri = input.sourceUrl || ''; 
      const title = input.manualData?.title || 'Untitled';
      const author = input.manualData?.author || 'Unknown';
      const description = input.manualData?.description || '';
      const tags = input.manualData?.tags || [];
      const contentType = stringToContentType(input.contentType);
      
      // Create the evermark on the blockchain
      const result = await evermarkNFTService.mintEvermark(metadataUri, title, author);
      
      // In a real implementation, we'd extract the token ID from the transaction receipt
      // For now, just create a placeholder ID
      const tokenId = result.hash.substring(0, 10); // Use part of tx hash as temporary ID
      
      // Create the evermark object
      const createdEvermark: Evermark = {
        id: tokenId,
        title,
        author,
        description,
        userId: user?.walletAddress || '',
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          tokenId,
          external_url: metadataUri,
          type: contentType,
          tags,
          voteCount: 0
        }
      };
      
      // Add the evermark to our IPFS index
      try {
        // Convert to index item format
        const indexItem: EvermarkIndexItem = {
          id: tokenId,
          title,
          author,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          owner: user?.walletAddress || '',
          metadataURI: metadataUri,
          contentType: input.contentType || 'WEBSITE',
          tags,
          voteCount: 0
        };
        
        // Update the index with the new evermark
        await ipfsIndexService.addOrUpdateEvermark(indexItem);
        console.log("Added new evermark to IPFS index");
      } catch (indexError) {
        console.error("Failed to update IPFS index:", indexError);
        // Continue anyway - the evermark was created on chain
      }
      
      return createdEvermark;
    } catch (err: any) {
      console.error('Failed to create evermark:', err);
      setError(`Failed to create evermark: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
      setCreating(false);
    }
  }, [user, stringToContentType]);

  // Initialize with total evermarks
  useEffect(() => {
    const fetchTotal = async () => {
      try {
        // Try to get the total from the blockchain
        const total = await evermarkNFTService.getTotalEvermarks();
        setTotalEvermarks(total);
      } catch (blockchainErr) {
        console.error('Failed to fetch total evermarks from blockchain:', blockchainErr);
        
        // Try to get the total from the index
        try {
          const index = await ipfsIndexService.getLatestIndex();
          setTotalEvermarks(index.evermarks.length);
        } catch (indexErr) {
          console.error('Failed to fetch total evermarks from index:', indexErr);
        }
      }
    };
    
    fetchTotal();
  }, []);

  return {
    loading,
    creating,
    error,
    userEvermarks,
    totalEvermarks,
    selectedEvermark,
    selectEvermark,
    list,
    fetchUserEvermarks,
    fetchEvermark,
    createEvermark
  };
}
