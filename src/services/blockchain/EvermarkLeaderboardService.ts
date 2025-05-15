// src/services/blockchain/EvermarkLeaderboardService.ts

import { BaseContractService } from './BaseContractService';
import { CONTRACT_ADDRESSES } from '../../config/constants';
import BookmarkLeaderboardABI from '../../config/abis/BookmarkLeaderboard.json';
import { errorLogger } from '../../utils/error-logger';

// Type definitions
export interface EvermarkRank {
  tokenId: string;
  votes: bigint;
  rank: number;
}

export class EvermarkLeaderboardService extends BaseContractService {
  /**
   * Get weekly top evermarks
   */
  async getWeeklyTopEvermarks(weekNumber: number, count: number = 10): Promise<EvermarkRank[]> {
    try {
      const leaderboardContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_LEADERBOARD,
        BookmarkLeaderboardABI
      );

      try {
        return await this.callContract<EvermarkRank[]>(
          leaderboardContract, 
          'getWeeklyTopBookmarks', 
          [weekNumber, count],
          { cache: true, cacheTime: 300000 } // 5 minutes
        );
      } catch (innerError) {
        errorLogger.log('evermarkLeaderboardService', innerError, { method: 'getWeeklyTopEvermarks:inner' });
        return [];
      }
    } catch (error) {
      errorLogger.log('evermarkLeaderboardService', error, { method: 'getWeeklyTopEvermarks', weekNumber, count });
      return [];
    }
  }
  
  /**
   * Get evermark rank for week
   */
  async getEvermarkRankForWeek(weekNumber: number, evermarkId: string): Promise<number> {
    try {
      const leaderboardContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_LEADERBOARD,
        BookmarkLeaderboardABI
      );

      try {
        const rank = await this.callContract<bigint>(
          leaderboardContract, 
          'getBookmarkRankForWeek', 
          [weekNumber, evermarkId],
          { cache: true, cacheTime: 300000 } // 5 minutes
        );
        return Number(rank);
      } catch (innerError) {
        errorLogger.log('evermarkLeaderboardService', innerError, { method: 'getEvermarkRankForWeek:inner' });
        return 0;
      }
    } catch (error) {
      errorLogger.log('evermarkLeaderboardService', error, { method: 'getEvermarkRankForWeek', weekNumber, evermarkId });
      return 0;
    }
  }
  
  /**
   * Check if leaderboard is finalized
   */
  async isLeaderboardFinalized(weekNumber: number): Promise<boolean> {
    try {
      const leaderboardContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_LEADERBOARD,
        BookmarkLeaderboardABI
      );

      try {
        return await this.callContract<boolean>(
          leaderboardContract, 
          'isLeaderboardFinalized', 
          [weekNumber],
          { cache: true, cacheTime: 300000 } // 5 minutes
        );
      } catch (innerError) {
        errorLogger.log('evermarkLeaderboardService', innerError, { method: 'isLeaderboardFinalized:inner' });
        return false;
      }
    } catch (error) {
      errorLogger.log('evermarkLeaderboardService', error, { method: 'isLeaderboardFinalized', weekNumber });
      return false;
    }
  }
}

// Export a singleton instance
export const evermarkLeaderboardService = new EvermarkLeaderboardService();
