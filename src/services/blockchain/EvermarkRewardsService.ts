// src/services/blockchain/EvermarkRewardsService.ts

import { ethers } from 'ethers';
import { BaseContractService } from './BaseContractService';
import { CONTRACT_ADDRESSES } from '../../config/constants';
import BookmarkRewardsABI from '../../config/abis/BookmarkRewards.json';
import { errorLogger } from '../../utils/error-logger';

export class EvermarkRewardsService extends BaseContractService {
  /**
   * Get pending rewards
   */
  async getPendingRewards(address: string): Promise<bigint> {
    try {
      const formattedAddress = ethers.getAddress(address);
      
      const rewardsContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_REWARDS,
        BookmarkRewardsABI
      );

      try {
        return await this.callContract<bigint>(
          rewardsContract, 
          'getPendingRewards', 
          [formattedAddress],
          { cache: true, cacheTime: 60000 } // 1 minute
        );
      } catch (innerError) {
        errorLogger.log('evermarkRewardsService', innerError, { method: 'getPendingRewards:inner' });
        return BigInt(0);
      }
    } catch (error) {
      errorLogger.log('evermarkRewardsService', error, { method: 'getPendingRewards', address });
      return BigInt(0);
    }
  }
  
  /**
   * Claim rewards
   */
  async claimRewards() {
    try {
      const signer = await this.getSigner();
      
      const rewardsContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_REWARDS,
        BookmarkRewardsABI,
        signer
      );
      
      const tx = await rewardsContract.claimRewards();
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('evermarkRewardsService', error, { method: 'claimRewards' });
      throw new Error(`Failed to claim rewards: ${error.message}`);
    }
  }
  
  /**
   * Update staking power
   */
  async updateStakingPower() {
    try {
      const signer = await this.getSigner();
      
      const rewardsContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_REWARDS,
        BookmarkRewardsABI,
        signer
      );
      
      const tx = await rewardsContract.updateStakingPower();
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('evermarkRewardsService', error, { method: 'updateStakingPower' });
      throw new Error(`Failed to update staking power: ${error.message}`);
    }
  }
}

// Export a singleton instance
export const evermarkRewardsService = new EvermarkRewardsService();
