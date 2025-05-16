// src/hooks/useLeaderboard.ts
import { useState, useEffect, useCallback } from 'react';
import { evermarkLeaderboardService, evermarkVotingService } from '../services/blockchain';
import { errorLogger } from '../utils/error-logger';
import { EvermarkRank } from '../types/blockchain.types';

export function useLeaderboard() {
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [topBookmarks, setTopBookmarks] = useState<EvermarkRank[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  
  // Get current voting cycle from the voting contract
  const fetchCurrentWeek = useCallback(async () => {
    try {
      // Use evermarkVotingService for cycle-related functionality
      const cycle = await evermarkVotingService.getCurrentCycle();
      setCurrentWeek(cycle);
      return cycle;
    } catch (err: any) {
      errorLogger.log('useLeaderboard', err, { method: 'fetchCurrentWeek' });
      return 0;
    }
  }, []);
  
  // Fetch top bookmarks
  const fetchTopBookmarks = useCallback(async (week: number = currentWeek, count: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if the leaderboard is finalized for this week
      const finalized = await evermarkLeaderboardService.isLeaderboardFinalized(week);
      setIsFinalized(finalized);
      
      // Get top evermarks
      const bookmarks = await evermarkLeaderboardService.getWeeklyTopEvermarks(week, count);
      setTopBookmarks(bookmarks);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch leaderboard';
      errorLogger.log('useLeaderboard', err, { method: 'fetchTopBookmarks', week, count });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentWeek]);
  
  // Get rank for a specific evermark
  const getEvermarkRank = useCallback(async (week: number, evermarkId: string) => {
    try {
      return await evermarkLeaderboardService.getEvermarkRankForWeek(week, evermarkId);
    } catch (err: any) {
      errorLogger.log('useLeaderboard', err, { method: 'getEvermarkRank', week, evermarkId });
      return 0;
    }
  }, []);
  
  // Initialize with current week
  useEffect(() => {
    const initializeLeaderboard = async () => {
      const week = await fetchCurrentWeek();
      if (week > 0) {
        await fetchTopBookmarks(week);
      }
    };
    
    initializeLeaderboard();
  }, [fetchCurrentWeek, fetchTopBookmarks]);
  
  return {
    currentWeek,
    topBookmarks,
    loading,
    error,
    isFinalized,
    fetchTopBookmarks,
    getEvermarkRank, // Updated method name for consistency
    fetchCurrentWeek,
  };
}