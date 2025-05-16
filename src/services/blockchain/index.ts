// src/services/blockchain/index.ts

import { ethers } from 'ethers';

// Standalone utility functions
export const formatEther = (value: bigint | string): string => {
  try {
    return ethers.formatEther(value);
  } catch (error) {
    return '0';
  }
};

export const parseEther = (value: string): bigint => {
  try {
    return ethers.parseEther(value);
  } catch (error) {
    return BigInt(0);
  }
};

// Export base contract service
export { BaseContractService, processBatch } from './BaseContractService';

// Export individual services
export { evermarkNFTService } from './EvermarkNFTService';
export type { EvermarkData } from './EvermarkNFTService';

export { evermarkVotingService } from './EvermarkVotingService';

export { tokenStakingService } from './TokenStakingService';
export type { UnbondingRequest } from './TokenStakingService';

export { evermarkRewardsService } from './EvermarkRewardsService';

export { evermarkLeaderboardService } from './EvermarkLeaderboardService';
export type { EvermarkRank } from './EvermarkLeaderboardService';

export { evermarkAuctionService } from './EvermarkAuctionService';
export type { EvermarkAuctionData } from './EvermarkAuctionService';

// Translation service exports
export { translationService } from './translation';

// Export event listener (after service exports)
export { eventListener } from './events';

// List of migrated services for tracking
export const migratedServices = [
  'EvermarkNFT',
  'EvermarkVoting',
  'TokenStaking',
  'EvermarkRewards',
  'EvermarkLeaderboard',
  'EvermarkAuction'
];

// Simplified network status function to avoid circular references
export const getNetworkStatus = (): 'connected' | 'connecting' | 'error' => {
  try {
    // Try using BaseContractService directly
    const { BaseContractService } = require('./BaseContractService');
    if (BaseContractService.prototype.getNetworkStatus) {
      const tempService = new BaseContractService();
      return tempService.getNetworkStatus();
    }
    
    // Or try just one service instead of looping through all of them
    const { evermarkNFTService } = require('./EvermarkNFTService');
    if (evermarkNFTService && typeof evermarkNFTService.getNetworkStatus === 'function') {
      return evermarkNFTService.getNetworkStatus();
    }
    
    return 'connected'; // Default fallback
  } catch (e) {
    console.error('Error getting network status:', e);
    return 'connected'; // Default fallback on error
  }
};