// src/hooks/useVoting.ts
import { useState, useEffect, useCallback } from 'react';
import { evermarkVotingService } from '../services/blockchain';
import { useAuth } from './useAuth';
import { ethers } from 'ethers';

export function useVoting() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [cycleEvermarks, setCycleEvermarks] = useState<string[]>([]);
  const [userVotes, setUserVotes] = useState<Map<string, bigint>>(new Map());
  const [totalUserVotes, setTotalUserVotes] = useState<bigint>(BigInt(0));
  const { user } = useAuth();

  // Get current voting cycle
  const getCurrentCycle = useCallback(async () => {
    try {
      const cycle = await evermarkVotingService.getCurrentCycle();
      setCurrentCycle(cycle);
      return cycle;
    } catch (err: any) {
      console.error('Failed to get current cycle:', err);
      return 0;
    }
  }, []);

  // Get time remaining in current cycle
  const getTimeRemaining = useCallback(async () => {
    try {
      const time = await evermarkVotingService.getTimeRemainingInCurrentCycle();
      setTimeRemaining(time);
      return time;
    } catch (err: any) {
      console.error('Failed to get time remaining:', err);
      return 0;
    }
  }, []);

  // Get evermarks with votes in current cycle
  const getEvermarksInCycle = useCallback(async (cycle?: number) => {
    try {
      const cycleNumber = cycle ?? currentCycle;
      const evermarks = await evermarkVotingService.getEvermarksWithVotesInCycle(cycleNumber);
      setCycleEvermarks(evermarks);
      return evermarks;
    } catch (err: any) {
      console.error('Failed to get evermarks in cycle:', err);
      return [];
    }
  }, [currentCycle]);

  // Get user votes for evermark
  const getUserVotesForEvermark = useCallback(async (evermarkId: string, userAddress?: string) => {
    try {
      const address = userAddress || (user?.walletAddress as string);
      
      if (!address) {
        return BigInt(0);
      }
      
      const votes = await evermarkVotingService.getUserVotesForEvermark(address, evermarkId);
      
      // Update the local map
      setUserVotes(prev => {
        const newMap = new Map(prev);
        newMap.set(evermarkId, votes);
        return newMap;
      });
      
      return votes;
    } catch (err: any) {
      console.error(`Failed to get user votes for evermark ${evermarkId}:`, err);
      return BigInt(0);
    }
  }, [user]);

  // Get total user votes in current cycle
  const getTotalUserVotes = useCallback(async (userAddress?: string) => {
    try {
      const address = userAddress || (user?.walletAddress as string);
      
      if (!address) {
        return BigInt(0);
      }
      
      const votes = await evermarkVotingService.getTotalUserVotesInCurrentCycle(address);
      setTotalUserVotes(votes);
      return votes;
    } catch (err: any) {
      console.error('Failed to get total user votes:', err);
      return BigInt(0);
    }
  }, [user]);

  // Delegate votes to evermark
  const delegateVotes = useCallback(async (evermarkId: string, amount: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await evermarkVotingService.delegateVotes(evermarkId, amount);
      
      // Update user votes after delegation
      if (user?.walletAddress) {
        await getUserVotesForEvermark(evermarkId);
        await getTotalUserVotes();
      }
      
      return result;
    } catch (err: any) {
      console.error(`Failed to delegate votes to evermark ${evermarkId}:`, err);
      setError(`Failed to delegate votes: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, getUserVotesForEvermark, getTotalUserVotes]);

  // Undelegate votes from evermark
  const undelegateVotes = useCallback(async (evermarkId: string, amount: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await evermarkVotingService.undelegateVotes(evermarkId, amount);
      
      // Update user votes after undelegation
      if (user?.walletAddress) {
        await getUserVotesForEvermark(evermarkId);
        await getTotalUserVotes();
      }
      
      return result;
    } catch (err: any) {
      console.error(`Failed to undelegate votes from evermark ${evermarkId}:`, err);
      setError(`Failed to undelegate votes: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, getUserVotesForEvermark, getTotalUserVotes]);

  // Format ether for display
  const formatEther = useCallback((value: bigint | string): string => {
    try {
      return ethers.formatEther(value);
    } catch (error) {
      return '0';
    }
  }, []);

  // Initialize with current cycle data
  useEffect(() => {
    const init = async () => {
      const cycle = await getCurrentCycle();
      await getTimeRemaining();
      await getEvermarksInCycle(cycle);
      
      if (user?.walletAddress) {
        await getTotalUserVotes();
      }
    };
    
    init();
    
    // Set up interval to update time remaining
    const interval = setInterval(getTimeRemaining, 10000); // every 10 seconds
    
    return () => clearInterval(interval);
  }, [getCurrentCycle, getTimeRemaining, getEvermarksInCycle, getTotalUserVotes, user]);

  return {
    loading,
    error,
    currentCycle,
    timeRemaining,
    cycleEvermarks,
    userVotes,
    totalUserVotes,
    getCurrentCycle,
    getTimeRemaining,
    getEvermarksInCycle,
    getUserVotesForEvermark,
    getTotalUserVotes,
    delegateVotes,
    undelegateVotes,
    formatEther
  };
}