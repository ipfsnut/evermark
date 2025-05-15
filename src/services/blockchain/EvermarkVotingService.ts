// src/services/blockchain/EvermarkVotingService.ts

import { ethers } from 'ethers';
import { BaseContractService } from './BaseContractService';
import { CONTRACT_ADDRESSES } from '../../config/constants';
import BookmarkVotingABI from '../../config/abis/BookmarkVoting.json';
import { errorLogger } from '../../utils/error-logger';

export class EvermarkVotingService extends BaseContractService {
  /**
   * Get evermark votes
   */
  async getEvermarkVotes(evermarkId: string): Promise<bigint> {
    try {
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        return await this.callContract<bigint>(
          votingContract, 
          'getBookmarkVotes', 
          [evermarkId],
          { cache: true, cacheTime: 60000 } // 1 minute
        );
      } catch (innerError) {
        errorLogger.log('evermarkVotingService', innerError, { method: 'getEvermarkVotes:inner' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('evermarkVotingService', error, { method: 'getEvermarkVotes', evermarkId });
      return BigInt(0);
    }
  }
  
  /**
   * Delegate votes to an evermark
   */
  async delegateVotes(evermarkId: string, amount: string) {
    try {
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI,
        signer
      );
      
      const amountWei = ethers.parseEther(amount);
      
      const tx = await contract.delegateVotes(evermarkId, amountWei);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('evermarkVotingService', error, { method: 'delegateVotes', evermarkId, amount });
      throw new Error(`Failed to delegate votes: ${error.message}`);
    }
  }
  
  /**
   * Undelegate votes from an evermark
   */
  async undelegateVotes(evermarkId: string, amount: string) {
    try {
      const signer = await this.getSigner();
      
      const contract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI,
        signer
      );
      
      const amountWei = ethers.parseEther(amount);
      
      const tx = await contract.undelegateVotes(evermarkId, amountWei);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('evermarkVotingService', error, { method: 'undelegateVotes', evermarkId, amount });
      throw new Error(`Failed to undelegate votes: ${error.message}`);
    }
  }
  
  /**
   * Get user votes for an evermark
   */
  async getUserVotesForEvermark(userAddress: string, evermarkId: string): Promise<bigint> {
    try {
      const formattedAddress = ethers.getAddress(userAddress);
      
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        return await this.callContract<bigint>(
          votingContract, 
          'getUserVotesForBookmark', 
          [formattedAddress, evermarkId],
          { cache: true, cacheTime: 60000 } // 1 minute
        );
      } catch (innerError) {
        errorLogger.log('evermarkVotingService', innerError, { method: 'getUserVotesForEvermark:inner' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('evermarkVotingService', error, { method: 'getUserVotesForEvermark', userAddress, evermarkId });
      return BigInt(0);
    }
  }
  
  /**
   * Get total user votes in current cycle
   */
  async getTotalUserVotesInCurrentCycle(userAddress: string): Promise<bigint> {
    try {
      const formattedAddress = ethers.getAddress(userAddress);
      
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        return await this.callContract<bigint>(
          votingContract, 
          'getTotalUserVotesInCurrentCycle', 
          [formattedAddress],
          { cache: true, cacheTime: 60000 } // 1 minute
        );
      } catch (innerError) {
        errorLogger.log('evermarkVotingService', innerError, { method: 'getTotalUserVotesInCurrentCycle:inner' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('evermarkVotingService', error, { method: 'getTotalUserVotesInCurrentCycle', userAddress });
      return BigInt(0);
    }
  }
  
  /**
   * Get evermarks with votes in cycle
   */
  async getEvermarksWithVotesInCycle(cycle: number): Promise<string[]> {
    try {
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        return await this.callContract<string[]>(
          votingContract, 
          'getBookmarksWithVotesInCycle', 
          [cycle],
          { cache: true, cacheTime: 300000 } // 5 minutes
        );
      } catch (innerError) {
        errorLogger.log('evermarkVotingService', innerError, { method: 'getEvermarksWithVotesInCycle:inner' });
        return [];
      }
    } catch (error) {
      errorLogger.log('evermarkVotingService', error, { method: 'getEvermarksWithVotesInCycle', cycle });
      return [];
    }
  }
  
  /**
   * Get current voting cycle
   */
  async getCurrentCycle(): Promise<number> {
    try {
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        const cycle = await this.callContract<bigint>(
          votingContract, 
          'getCurrentCycle', 
          [],
          { cache: true, cacheTime: 60000 } // 1 minute 
        );
        return Number(cycle);
      } catch (innerError) {
        errorLogger.log('evermarkVotingService', innerError, { method: 'getCurrentCycle:inner' });
        return 0;
      }
    } catch (error) {
      errorLogger.log('evermarkVotingService', error, { method: 'getCurrentCycle' });
      return 0;
    }
  }
  
  /**
   * Get time remaining in current cycle
   */
  async getTimeRemainingInCurrentCycle(): Promise<number> {
    try {
      const votingContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_VOTING,
        BookmarkVotingABI
      );

      try {
        const timeRemaining = await this.callContract<bigint>(
          votingContract, 
          'getTimeRemainingInCurrentCycle', 
          [],
          { cache: true, cacheTime: 30000 } // 30 seconds
        );
        return Number(timeRemaining);
      } catch (innerError) {
        errorLogger.log('evermarkVotingService', innerError, { method: 'getTimeRemainingInCurrentCycle:inner' });
        return 0;
      }
    } catch (error) {
      errorLogger.log('evermarkVotingService', error, { method: 'getTimeRemainingInCurrentCycle' });
      return 0;
    }
  }
}

// Export a singleton instance
export const evermarkVotingService = new EvermarkVotingService();