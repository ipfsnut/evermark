import { Contract } from 'ethers';

export interface ContractInfo {
  address: string;
  abi: any[];
  name: string;
}

export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  status: number;
  gasUsed: bigint;
}

export interface TransactionState {
  hash: string | null;
  status: 'idle' | 'pending' | 'success' | 'error';
  error: string | null;
  receipt: TransactionReceipt | null;
}

// Blockchain Events
export interface BlockchainEvent {
  type: string;
  contractAddress: string;
  blockNumber: number;
  transactionHash: string;
  args: any[];
  timestamp: number;
}

// Contract States
export interface ContractState {
  [key: string]: {
    instance: Contract | null;
    loading: boolean;
    error: string | null;
  };
}

// Staking types
export interface StakeInfo {
  amount: bigint;
  votingPower: bigint;
  unbondingRequests: UnbondingRequest[];
}

export interface UnbondingRequest {
  amount: bigint;
  releaseTime: number;
  index: number;
}

// Voting types
export interface VoteInfo {
  evermarkId: string;
  power: bigint;
  timestamp: number;
}

export interface EvermarkRank {
  tokenId: string;
  votes: bigint;
  rank: number;
}

export interface EvermarkAuctionData {
  tokenId: string;
  nftContract: string;
  seller: string;
  startingPrice: bigint;
  reservePrice: bigint;
  currentBid: bigint;
  highestBidder: string;
  startTime: number;
  endTime: number;
  finalized: boolean;
}

// Export type aliases for backward compatibility with existing code
export type BookmarkRank = EvermarkRank;
export type AuctionData = EvermarkAuctionData;
export type BookmarkAuctionData = EvermarkAuctionData;
