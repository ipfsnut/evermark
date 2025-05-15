// src/hooks/useVoting.ts
import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { contractService } from '../services/blockchain';
import { errorLogger } from '../utils/error-logger';

export function useVoting() {
  const { address, isConnected } = useAccount();
  const [votes, setVotes] = useState<bigint>(BigInt(0));
  const [userVotes, setUserVotes] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(false);
  const [votingLoading, setVotingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [votingError, setVotingError] = useState<string | null>(null);
  const [cycle, setCycle] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Fetch bookmark votes
  const getBookmarkVotes = useCallback(async (evermarkId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const totalVotes = await contractService.getBookmarkVotes(evermarkId);
      setVotes(totalVotes);
      return totalVotes;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch votes';
      errorLogger.log('useVoting', err, { method: 'getBookmarkVotes', evermarkId });
      setError(errorMessage);
      return BigInt(0);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's votes for a bookmark
  const getUserVotes = useCallback(async (evermarkId: string) => {
    if (!address) return BigInt(0);
    
    setLoading(true);
    setError(null);
    
    try {
      const votes = await contractService.getUserVotesForBookmark(address, evermarkId);
      setUserVotes(votes);
      return votes;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch user votes';
      errorLogger.log('useVoting', err, { method: 'getUserVotes', evermarkId, address });
      setError(errorMessage);
      return BigInt(0);
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Vote on a bookmark
  const voteOnBookmark = useCallback(async (evermarkId: string, amount: string) => {
    if (!address) return false;
    
    setVotingLoading(true);
    setVotingError(null);
    
    try {
      const { wait } = await contractService.delegateVotes(evermarkId, amount);
      await wait();
      
      // Refresh votes
      await getBookmarkVotes(evermarkId);
      if (address) await getUserVotes(evermarkId);
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to vote';
      errorLogger.log('useVoting', err, { method: 'voteOnBookmark', evermarkId, amount });
      setVotingError(errorMessage);
      return false;
    } finally {
      setVotingLoading(false);
    }
  }, [address, getBookmarkVotes, getUserVotes]);

  // Remove votes from a bookmark
  const removeVotes = useCallback(async (evermarkId: string, amount: string) => {
    if (!address) return false;
    
    setVotingLoading(true);
    setVotingError(null);
    
    try {
      const { wait } = await contractService.undelegateVotes(evermarkId, amount);
      await wait();
      
      // Refresh votes
      await getBookmarkVotes(evermarkId);
      if (address) await getUserVotes(evermarkId);
      
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to remove votes';
      errorLogger.log('useVoting', err, { method: 'removeVotes', evermarkId, amount });
      setVotingError(errorMessage);
      return false;
    } finally {
      setVotingLoading(false);
    }
  }, [address, getBookmarkVotes, getUserVotes]);

  // Get current cycle information
  const fetchCycleInfo = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [currentCycle, remaining] = await Promise.all([
        contractService.getCurrentCycle(),
        contractService.getTimeRemainingInCurrentCycle()
      ]);
      
      setCycle(currentCycle);
      setTimeRemaining(remaining);
      
      return { cycle: currentCycle, timeRemaining: remaining };
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch cycle info';
      errorLogger.log('useVoting', err, { method: 'fetchCycleInfo' });
      setError(errorMessage);
      return { cycle: 0, timeRemaining: 0 };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    votes,
    userVotes,
    cycle,
    timeRemaining,
    loading,
    votingLoading,
    error,
    votingError,
    getBookmarkVotes,
    getUserVotes,
    voteOnBookmark,
    removeVotes,
    fetchCycleInfo,
  };
}