// src/hooks/useEvermarks.ts
import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { evermarkService } from '../services/evermark';
import { Evermark, CreateEvermarkInput } from '../types/evermark.types';

interface EvermarksState {
  evermarks: Evermark[];
  userEvermarks: Evermark[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  selectedEvermark: Evermark | null;
}

interface UseEvermarksReturn extends EvermarksState {
  createEvermark: (input: CreateEvermarkInput) => Promise<Evermark | null>;
  fetchEvermark: (tokenId: string) => Promise<Evermark | null>;
  fetchUserEvermarks: () => Promise<void>;
  selectEvermark: (evermark: Evermark | null) => void;
  refreshEvermarks: () => Promise<void>;
  searchEvermarks: (query: string) => Promise<Evermark[]>;
  list: (userAddress?: string) => Promise<Evermark[]>;
  vote: (evermarkId: string, amount: string) => Promise<boolean>;
  getVotes: (evermarkId: string) => Promise<bigint>;
}

export function useEvermarks(): UseEvermarksReturn {
  const { address, isConnected } = useAccount();
  
  const [state, setState] = useState<EvermarksState>({
    evermarks: [],
    userEvermarks: [],
    loading: false,
    error: null,
    creating: false,
    selectedEvermark: null,
  });

  // Fetch user's evermarks when connected
  useEffect(() => {
    if (isConnected && address) {
      fetchUserEvermarks();
    } else {
      setState(prev => ({ ...prev, userEvermarks: [] }));
    }
  }, [isConnected, address]);

  // Create a new evermark
  const createEvermark = useCallback(async (input: CreateEvermarkInput): Promise<Evermark | null> => {
    setState(prev => ({ ...prev, creating: true, error: null }));
    
    try {
      const evermark = await evermarkService.create(input);
      
      // Add to user's evermarks
      setState(prev => ({
        ...prev,
        userEvermarks: [evermark, ...prev.userEvermarks],
        evermarks: [evermark, ...prev.evermarks],
        creating: false,
      }));
      
      return evermark;
    } catch (error: any) {
      console.error('Failed to create evermark:', error);
      setState(prev => ({
        ...prev,
        creating: false,
        error: error.message || 'Failed to create evermark',
      }));
      return null;
    }
  }, []);

  // Fetch a single evermark by token ID
  const fetchEvermark = useCallback(async (tokenId: string): Promise<Evermark | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const evermark = await evermarkService.fetch(tokenId);
      
      if (evermark) {
        // Update state with the fetched evermark
        setState(prev => {
          const exists = prev.evermarks.find(e => e.id === evermark.id);
          return {
            ...prev,
            evermarks: exists 
              ? prev.evermarks.map(e => e.id === evermark.id ? evermark : e)
              : [...prev.evermarks, evermark],
            loading: false,
          };
        });
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }
      
      return evermark;
    } catch (error: any) {
      console.error('Failed to fetch evermark:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch evermark',
      }));
      return null;
    }
  }, []);

  // Fetch user's evermarks
  const fetchUserEvermarks = useCallback(async () => {
    if (!address) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const userEvermarks = await evermarkService.list(address);
      
      setState(prev => ({
        ...prev,
        userEvermarks,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to fetch user evermarks:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch user evermarks',
      }));
    }
  }, [address]);

  // Select an evermark for detailed view
  const selectEvermark = useCallback((evermark: Evermark | null) => {
    setState(prev => ({ ...prev, selectedEvermark: evermark }));
  }, []);

  // Refresh all evermarks
  const refreshEvermarks = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Fetch both all evermarks and user evermarks in parallel
      const [allEvermarks, userEvermarks] = await Promise.all([
        evermarkService.list(),
        address ? evermarkService.list(address) : Promise.resolve([]),
      ]);
      
      setState(prev => ({
        ...prev,
        evermarks: allEvermarks,
        userEvermarks,
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to refresh evermarks:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to refresh evermarks',
      }));
    }
  }, [address]);

  // Search evermarks
  const searchEvermarks = useCallback(async (query: string): Promise<Evermark[]> => {
    try {
      return await evermarkService.search(query);
    } catch (error: any) {
      console.error('Search failed:', error);
      throw error;
    }
  }, []);

  // List evermarks (with optional user filter)
  const list = useCallback(async (userAddress?: string): Promise<Evermark[]> => {
    try {
      return await evermarkService.list(userAddress);
    } catch (error: any) {
      console.error('Failed to list evermarks:', error);
      throw error;
    }
  }, []);

  // Vote on an evermark
  const vote = useCallback(async (evermarkId: string, amount: string): Promise<boolean> => {
    try {
      await evermarkService.vote(evermarkId, amount);
      
      // After successful vote, refresh the evermark data
      if (state.selectedEvermark?.id === evermarkId) {
        await fetchEvermark(evermarkId);
      }
      
      return true;
    } catch (error: any) {
      console.error('Vote failed:', error);
      throw error;
    }
  }, [state.selectedEvermark?.id, fetchEvermark]);

  // Get vote count for an evermark
  const getVotes = useCallback(async (evermarkId: string): Promise<bigint> => {
    try {
      return await evermarkService.getVotes(evermarkId);
    } catch (error: any) {
      console.error('Failed to get votes:', error);
      throw error;
    }
  }, []);

  return {
    ...state,
    createEvermark,
    fetchEvermark,
    fetchUserEvermarks,
    selectEvermark,
    refreshEvermarks,
    searchEvermarks,
    list,
    vote,
    getVotes,
  };
}