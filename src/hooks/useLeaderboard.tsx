// src/hooks/useLeaderboard.ts
import { useState, useEffect, useCallback } from 'react';
import { evermarkLeaderboardService, evermarkVotingService, EvermarkRank } from '../services/blockchain';
import { useAuth } from './useAuth';

export function useLeaderboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [topBookmarks, setTopBookmarks] = useState<EvermarkRank[]>([]);
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  const { user } = useAuth();

  // Get current cycle (called currentWeek in the UI)
  const fetchCurrentCycle = useCallback(async () => {
    try {
      const cycle = await evermarkVotingService.getCurrentCycle();
      setCurrentWeek(cycle);
      return cycle;
    } catch (err: any) {
      console.error('Failed to fetch current cycle:', err);
      setError('Failed to fetch current cycle');
      return 0;
    }
  }, []);

  // Check if leaderboard is finalized
  const checkIsFinalized = useCallback(async (weekNumber: number) => {
    try {
      const finalized = await evermarkLeaderboardService.isLeaderboardFinalized(weekNumber);
      setIsFinalized(finalized);
      return finalized;
    } catch (err: any) {
      console.error('Failed to check if leaderboard is finalized:', err);
      return false;
    }
  }, []);

  // Fetch top evermarks for a given week
  const fetchTopBookmarks = useCallback(async (weekNumber: number, count: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const evermarks = await evermarkLeaderboardService.getWeeklyTopEvermarks(weekNumber, count);
      setTopBookmarks(evermarks);
      
      // Check if the leaderboard is finalized
      await checkIsFinalized(weekNumber);
    } catch (err: any) {
      console.error('Failed to fetch top evermarks:', err);
      setError('Failed to fetch leaderboard data');
      setTopBookmarks([]);
    } finally {
      setLoading(false);
    }
  }, [checkIsFinalized]);

  // Get evermark rank for a specific week
  const getBookmarkRankForWeek = useCallback(async (weekNumber: number, bookmarkId: string) => {
    try {
      return await evermarkLeaderboardService.getEvermarkRankForWeek(weekNumber, bookmarkId);
    } catch (err: any) {
      console.error('Failed to fetch evermark rank:', err);
      return 0;
    }
  }, []);

  // Initialize with current cycle data
  useEffect(() => {
    const init = async () => {
      const cycle = await fetchCurrentCycle();
      await fetchTopBookmarks(cycle);
    };
    
    init();
  }, [fetchCurrentCycle, fetchTopBookmarks]);

  return {
    loading,
    error,
    topBookmarks,  // Note: UI expects this name, not topEvermarks
    currentWeek,   // Note: UI expects this name, not currentCycle
    isFinalized,
    fetchTopBookmarks,  // Note: UI expects this name, not fetchTopEvermarks
    fetchCurrentCycle,
    getBookmarkRankForWeek  // Note: UI expects this name, not getEvermarkRankForWeek
  };
}