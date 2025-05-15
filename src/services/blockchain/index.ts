// src/services/blockchain/index.ts

// Export existing services for backward compatibility
export { contractService, formatEther, parseEther } from './contracts';
export { eventListener } from './events';

// Export new refactored services
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

// Additional export to indicate which services have been migrated
// This helps track migration progress
export const migratedServices = [
  'EvermarkNFT',
  'EvermarkVoting',
  'TokenStaking',
  'EvermarkRewards',
  'EvermarkLeaderboard',
  'EvermarkAuction'
];

// No IPFS imports - all IPFS operations are handled via Netlify functions
