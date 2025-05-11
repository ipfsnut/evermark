export interface User {
    id: string;
    walletAddress: string;
    fid?: number; // Fixed: should be number to match database schema
    username?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface Session {
    token: string;
    userId: string;
    walletAddress: string;
    expiresAt: string;
  }
  
  export interface AuthState {
    user: User | null;
    session: Session | null;
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
  }
  
  // Token types
  export interface TokenBalance {
    available: bigint;
    staked: bigint;
    votingPower: bigint;
    locked: bigint;
  }
  
  export interface TokenTransaction {
    id: string;
    userId: string;
    amount: number; // Fixed: database stores as number, not bigint
    type: 'credit' | 'debit';
    reason: string;
    createdAt: string;
  }