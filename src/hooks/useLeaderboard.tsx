// src/hooks/useLeaderboard.ts
import { useState, useEffect, useCallback } from 'react';
import { evermarkLeaderboardService, evermarkVotingService, EvermarkRank } from '../services/blockchain';
import { useAuth } from './useAuth';

export function useLeaderboard() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [topEvermarks, setTopEvermarks] = useState<EvermarkRank[]>([]);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  const { user } = useAuth();

  // Get current cycle
  const fetchCurrentCycle = useCallback(async () => {
    try {
      const cycle = await evermarkVotingService.getCurrentCycle();
      setCurrentCycle(cycle);
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
  const fetchTopEvermarks = useCallback(async (weekNumber: number, count: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const evermarks = await evermarkLeaderboardService.getWeeklyTopEvermarks(weekNumber, count);
      setTopEvermarks(evermarks);
      
      // Check if the leaderboard is finalized
      await checkIsFinalized(weekNumber);
    } catch (err: any) {
      console.error('Failed to fetch top evermarks:', err);
      setError('Failed to fetch leaderboard data');
      setTopEvermarks([]);
    } finally {
      setLoading(false);
    }
  }, [checkIsFinalized]);

  // Get evermark rank for a specific week
  const getEvermarkRankForWeek = useCallback(async (weekNumber: number, evermarkId: string) => {
    try {
      return await evermarkLeaderboardService.getEvermarkRankForWeek(weekNumber, evermarkId);
    } catch (err: any) {
      console.error('Failed to fetch evermark rank:', err);
      return 0;
    }
  }, []);

  // Initialize with current cycle data
  useEffect(() => {
    const init = async () => {
      const cycle = await fetchCurrentCycle();
      await fetchTopEvermarks(cycle);
    };
    
    init();
  }, [fetchCurrentCycle, fetchTopEvermarks]);

  return {
    loading,
    error,
    topEvermarks,
    currentCycle,
    isFinalized,
    fetchTopEvermarks,
    fetchCurrentCycle,
    getEvermarkRankForWeek
  };
}