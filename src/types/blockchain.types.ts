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