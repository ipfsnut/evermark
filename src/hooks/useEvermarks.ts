// src/hooks/useEvermarks.ts
import { useState, useEffect, useCallback } from 'react';
import { evermarkNFTService, evermarkVotingService } from '../services/blockchain';
import { useAuth } from './useAuth';
import { Evermark, CreateEvermarkInput, ContentType } from '../types/evermark.types';

// Temporarily disable index functionality until after Netlify deployment
const ENABLE_INDEX = false;

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

  // Select an evermark for detail view
  const selectEvermark = useCallback((evermark: Evermark | null) => {
    setSelectedEvermark(evermark);
  }, []);

  // List evermarks (used by HomePage)
  const list = useCallback(async () => {
    setLoading(true);
    
    try {
      // Get a list of evermarks to display
      // For now, use the current user's evermarks
      const addr = user?.walletAddress;
      if (addr) {
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
        
        // Sort by recent first
        return evermarks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      }
      
      // If no user, try to get some recent evermarks from the contract
      const total = await evermarkNFTService.getTotalEvermarks();
      if (total > 0) {
        const evermarks: Evermark[] = [];
        // Get up to 10 of the most recent tokens
        const startId = Math.max(1, total - 10);
        for (let i = total; i >= startId; i--) {
          try {
            const tokenId = i.toString();
            const details = await evermarkNFTService.getEvermark(tokenId);
            if (details && details.exists) {
              evermarks.push(convertToEvermark(tokenId, details));
            }
          } catch (err) {
            console.warn(`Failed to fetch evermark ${i}:`, err);
          }
        }
        return evermarks;
      }
      
      return [];
    } catch (err: any) {
      console.error('List evermarks failed:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, convertToEvermark]);

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
      const details = await evermarkNFTService.getEvermark(id);
      
      if (!details || !details.exists) {
        throw new Error('Evermark not found');
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
    } catch (err: any) {
      console.error(`Failed to fetch evermark ${id}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [convertToEvermark]);

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
      
      // Convert the content type string to the enum
      const contentType = stringToContentType(input.contentType);
      
      // Mint the evermark NFT on the blockchain
      const result = await evermarkNFTService.mintEvermark(metadataUri, title, author);
      
      // Extract the token ID from the transaction result
      // In the current implementation this is using the transaction hash temporarily
      const tokenId = result.hash.substring(0, 10);
      
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
        const total = await evermarkNFTService.getTotalEvermarks();
        setTotalEvermarks(total);
      } catch (err) {
        console.error('Failed to fetch total evermarks:', err);
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
