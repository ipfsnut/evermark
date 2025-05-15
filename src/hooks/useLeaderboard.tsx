// src/hooks/useLeaderboard.ts
import { useState, useEffect, useCallback } from 'react';
import { contractService } from '../services/blockchain';
import { errorLogger } from '../utils/error-logger';
import { BookmarkRank } from '../types/blockchain.types';

export function useLeaderboard() {
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [topBookmarks, setTopBookmarks] = useState<BookmarkRank[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFinalized, setIsFinalized] = useState<boolean>(false);
  
  // Get current voting cycle from the voting contract
  const fetchCurrentWeek = useCallback(async () => {
    try {
      const cycle = await contractService.getCurrentCycle();
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
      const finalized = await contractService.isLeaderboardFinalized(week);
      setIsFinalized(finalized);
      
      // Get top bookmarks
      const bookmarks = await contractService.getWeeklyTopBookmarks(week, count);
      setTopBookmarks(bookmarks);
      
      // Fetch metadata for each bookmark (if needed)
      // You could add this step if you want to display more information
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch leaderboard';
      errorLogger.log('useLeaderboard', err, { method: 'fetchTopBookmarks', week, count });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [currentWeek]);
  
  // Get rank for a specific bookmark
  const getBookmarkRank = useCallback(async (week: number, bookmarkId: string) => {
    try {
      return await contractService.getBookmarkRankForWeek(week, bookmarkId);
    } catch (err: any) {
      errorLogger.log('useLeaderboard', err, { method: 'getBookmarkRank', week, bookmarkId });
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
    getBookmarkRank,
    fetchCurrentWeek,
  };
}