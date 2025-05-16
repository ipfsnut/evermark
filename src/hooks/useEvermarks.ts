// src/hooks/useEvermarks.ts
import { useState, useEffect, useCallback } from 'react';
import { evermarkNFTService, evermarkVotingService, EvermarkData } from '../services/blockchain';
import { useAuth } from './useAuth';

export function useEvermarks() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userEvermarks, setUserEvermarks] = useState<string[]>([]);
  const [evermarkDetails, setEvermarkDetails] = useState<{ [tokenId: string]: EvermarkData }>({});
  const [totalEvermarks, setTotalEvermarks] = useState<number>(0);
  const { user } = useAuth();

  // Fetch total number of evermarks
  const fetchTotalEvermarks = useCallback(async () => {
    try {
      const total = await evermarkNFTService.getTotalEvermarks();
      setTotalEvermarks(total);
      return total;
    } catch (err: any) {
      console.error('Failed to fetch total evermarks:', err);
      return 0;
    }
  }, []);

  // Fetch user's evermarks
  const fetchUserEvermarks = useCallback(async (address?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const userAddress = address || (user?.walletAddress as string);
      
      if (!userAddress) {
        setUserEvermarks([]);
        return [];
      }
      
      const evermarks = await evermarkNFTService.getUserEvermarks(userAddress);
      setUserEvermarks(evermarks);
      return evermarks;
    } catch (err: any) {
      console.error('Failed to fetch user evermarks:', err);
      setError('Failed to fetch your evermarks');
      setUserEvermarks([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch evermark details
  const fetchEvermarkDetails = useCallback(async (tokenId: string) => {
    setLoading(true);
    
    try {
      const details = await evermarkNFTService.getEvermark(tokenId);
      
      if (details) {
        setEvermarkDetails(prev => ({
          ...prev,
          [tokenId]: details
        }));
      }
      
      return details;
    } catch (err: any) {
      console.error(`Failed to fetch evermark details for ${tokenId}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get evermark votes
  const getEvermarkVotes = useCallback(async (evermarkId: string) => {
    try {
      return await evermarkVotingService.getEvermarkVotes(evermarkId);
    } catch (err: any) {
      console.error(`Failed to fetch votes for evermark ${evermarkId}:`, err);
      return BigInt(0);
    }
  }, []);

  // Create new evermark
  const createEvermark = useCallback(async (metadataUri: string, title: string, author: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await evermarkNFTService.mintEvermark(metadataUri, title, author);
      // Refresh user's evermarks after creation
      await fetchUserEvermarks();
      return result;
    } catch (err: any) {
      console.error('Failed to create evermark:', err);
      setError(`Failed to create evermark: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchUserEvermarks]);

  // Update evermark metadata
  const updateEvermarkMetadata = useCallback(async (tokenId: string, metadataURI: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await evermarkNFTService.updateEvermarkMetadata(tokenId, metadataURI);
      // Refresh evermark details after update
      await fetchEvermarkDetails(tokenId);
      return result;
    } catch (err: any) {
      console.error(`Failed to update evermark ${tokenId}:`, err);
      setError(`Failed to update evermark: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchEvermarkDetails]);

  // Initialize with total evermarks
  useEffect(() => {
    fetchTotalEvermarks();
  }, [fetchTotalEvermarks]);

  // Initialize with user's evermarks if user is logged in
  useEffect(() => {
    if (user?.walletAddress) {
      fetchUserEvermarks();
    }
  }, [user, fetchUserEvermarks]);

  return {
    loading,
    error,
    userEvermarks,
    evermarkDetails,
    totalEvermarks,
    fetchUserEvermarks,
    fetchEvermarkDetails,
    fetchTotalEvermarks,
    getEvermarkVotes,
    createEvermark,
    updateEvermarkMetadata
  };
}