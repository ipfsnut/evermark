// src/hooks/useEvermarks.ts
import { useState, useEffect, useCallback } from 'react';
import { evermarkNFTService, evermarkVotingService } from '../services/blockchain';
import { useAuth } from './useAuth';
import { Evermark, CreateEvermarkInput } from '../types/evermark.types'; // Assuming these types exist

export function useEvermarks() {
  const [loading, setLoading] = useState<boolean>(false);
  const [creating, setCreating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userEvermarks, setUserEvermarks] = useState<Evermark[]>([]);
  const [totalEvermarks, setTotalEvermarks] = useState<number>(0);
  const [selectedEvermark, setSelectedEvermark] = useState<Evermark | null>(null);
  const { user } = useAuth();

  // Helper to convert service data to UI format
  const convertToEvermark = useCallback((tokenId: string, data: any): Evermark => {
  return {
    id: tokenId,
    title: data.title || 'Untitled',
    author: data.author || 'Unknown',
    description: '',  // This would be filled from metadata if available
    userId: data.owner || '',
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    metadata: {
      tokenId,
      external_url: data.metadataURI,
      type: data.type || 'WEBSITE',  // Add the required type field with a default value
      ...data
    }
  };
}, []);

  // Select an evermark for detail view
  const selectEvermark = useCallback((evermark: Evermark | null) => {
    setSelectedEvermark(evermark);
  }, []);

  // List evermarks (used by HomePage)
  const list = useCallback(async (userAddress?: string) => {
    setLoading(true);
    
    try {
      let tokenIds: string[] = [];
      
      if (userAddress) {
        // Get user's evermarks
        tokenIds = await evermarkNFTService.getUserEvermarks(userAddress);
      } else {
        // Get a sampled list of all evermarks - this would need proper implementation
        // For now, just use some dummy data or the user's own evermarks
        const addr = user?.walletAddress;
        if (addr) {
          tokenIds = await evermarkNFTService.getUserEvermarks(addr);
        }
      }
      
      // Fetch details for each token
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
          evermark.metadata.totalVotes = Number(votes);
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
      const metadataUri = input.sourceUrl || ''; // In a real app, this would be an IPFS URI
      const title = input.manualData?.title || 'Untitled';
      const author = input.manualData?.author || 'Unknown';
      
      const result = await evermarkNFTService.mintEvermark(metadataUri, title, author);
      
      // In a real implementation, we'd extract the token ID from the transaction receipt
      // For now, just create a placeholder evermark
      const createdEvermark: Evermark = {
        id: result.hash.substring(0, 10), // Use part of tx hash as temporary ID
        title,
        author,
        description: input.manualData?.description || '',
        userId: user?.walletAddress || '',
        verified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        metadata: {
          tokenId: result.hash.substring(0, 10),
          external_url: metadataUri,
          ...input.manualData
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
  }, [user]);

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