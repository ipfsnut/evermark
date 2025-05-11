import { useState, useEffect, useCallback } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { contractService, formatEther } from '../services/blockchain';
import { TokenBalance, StakeInfo, TransactionState } from '../types';

interface BlockchainState {
  balances: TokenBalance;
  stakeInfo: StakeInfo;
  loading: boolean;
  error: string | null;
  transaction: TransactionState;
}

interface UseBlockchainReturn extends BlockchainState {
  refreshBalances: () => Promise<void>;
  stakeTokens: (amount: string) => Promise<boolean>;
  withdrawTokens: (amount: string) => Promise<boolean>;
  completeUnwrap: (requestIndex: number) => Promise<boolean>;
  clearTransaction: () => void;
}

export function useBlockchain(): UseBlockchainReturn {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  
  const [state, setState] = useState<BlockchainState>({
    balances: {
      available: BigInt(0),
      staked: BigInt(0),
      votingPower: BigInt(0),
      locked: BigInt(0),
    },
    stakeInfo: {
      amount: BigInt(0),
      votingPower: BigInt(0),
      unbondingRequests: [],
    },
    loading: false,
    error: null,
    transaction: {
      hash: null,
      status: 'idle',
      error: null,
      receipt: null,
    },
  });

  // Auto-refresh balances when connected
  useEffect(() => {
    if (isConnected && address) {
      refreshBalances();
      
      // Set up polling interval
      const interval = setInterval(refreshBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address]);

  // Refresh all blockchain data
  const refreshBalances = useCallback(async () => {
    if (!address) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Fetch all balances in parallel
      const [
        nsiBalance,
        stakedBalance,
        votingPower,
        availableVotingPower,
        unbondingRequests,
      ] = await Promise.all([
        contractService.getNSIBalance(address),
        contractService.getStakedBalance(address),
        contractService.getVotingPower(address),
        contractService.getAvailableVotingPower(address),
        contractService.getUnbondingRequests ? contractService.getUnbondingRequests(address) : Promise.resolve([]),
      ]);
      
      // Calculate locked amount
      const lockedAmount = unbondingRequests.reduce((sum, req) => sum + req.amount, BigInt(0));
      
      setState(prev => ({
        ...prev,
        balances: {
          available: nsiBalance ? BigInt(nsiBalance) : BigInt(0),
          staked: stakedBalance ? BigInt(stakedBalance) : BigInt(0),
          votingPower: votingPower ? BigInt(votingPower) : BigInt(0),
          locked: lockedAmount,
        },
        stakeInfo: {
          amount: stakedBalance ? BigInt(stakedBalance) : BigInt(0),
          votingPower: availableVotingPower ? BigInt(availableVotingPower) : BigInt(0),
          unbondingRequests: unbondingRequests || [],
        },
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to refresh balances:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to refresh balances',
      }));
    }
  }, [address]);

  // Stake NSI tokens
  const stakeTokens = useCallback(async (amount: string): Promise<boolean> => {
    if (!address) return false;
    
    setState(prev => ({
      ...prev,
      transaction: { hash: null, status: 'pending', error: null, receipt: null },
    }));
    
    try {
      const result = await contractService.wrapTokens(amount);
      
      setState(prev => ({
        ...prev,
        transaction: { ...prev.transaction, hash: result.hash },
      }));
      
      // Wait for transaction
      const receipt = await result.wait();
      
      setState(prev => ({
        ...prev,
        transaction: { hash: result.hash, status: 'success', error: null, receipt },
      }));
      
      // Refresh balances
      await refreshBalances();
      
      return true;
    } catch (error: any) {
      console.error('Failed to stake tokens:', error);
      setState(prev => ({
        ...prev,
        transaction: { 
          hash: null, 
          status: 'error', 
          error: error.message || 'Failed to stake tokens', 
          receipt: null 
        },
      }));
      return false;
    }
  }, [address, refreshBalances]);

  // Request to withdraw tokens
  const withdrawTokens = useCallback(async (amount: string): Promise<boolean> => {
    if (!address) return false;
    
    setState(prev => ({
      ...prev,
      transaction: { hash: null, status: 'pending', error: null, receipt: null },
    }));
    
    try {
      const result = await contractService.requestUnwrap(amount);
      
      setState(prev => ({
        ...prev,
        transaction: { ...prev.transaction, hash: result.hash },
      }));
      
      // Wait for transaction
      const receipt = await result.wait();
      
      setState(prev => ({
        ...prev,
        transaction: { hash: result.hash, status: 'success', error: null, receipt },
      }));
      
      // Refresh balances
      await refreshBalances();
      
      return true;
    } catch (error: any) {
      console.error('Failed to request withdrawal:', error);
      setState(prev => ({
        ...prev,
        transaction: { 
          hash: null, 
          status: 'error', 
          error: error.message || 'Failed to request withdrawal', 
          receipt: null 
        },
      }));
      return false;
    }
  }, [address, refreshBalances]);

  // Complete withdrawal after unbonding period
  const completeUnwrap = useCallback(async (requestIndex: number): Promise<boolean> => {
    if (!address) return false;
    
    setState(prev => ({
      ...prev,
      transaction: { hash: null, status: 'pending', error: null, receipt: null },
    }));
    
    try {
      const result = await contractService.completeUnwrap(requestIndex);
      
      setState(prev => ({
        ...prev,
        transaction: { ...prev.transaction, hash: result.hash },
      }));
      
      // Wait for transaction
      const receipt = await result.wait();
      
      setState(prev => ({
        ...prev,
        transaction: { hash: result.hash, status: 'success', error: null, receipt },
      }));
      
      // Refresh balances
      await refreshBalances();
      
      return true;
    } catch (error: any) {
      console.error('Failed to complete withdrawal:', error);
      setState(prev => ({
        ...prev,
        transaction: { 
          hash: null, 
          status: 'error', 
          error: error.message || 'Failed to complete withdrawal', 
          receipt: null 
        },
      }));
      return false;
    }
  }, [address, refreshBalances]);

  // Clear transaction state
  const clearTransaction = useCallback(() => {
    setState(prev => ({
      ...prev,
      transaction: { hash: null, status: 'idle', error: null, receipt: null },
    }));
  }, []);

  return {
    ...state,
    refreshBalances,
    stakeTokens,
    withdrawTokens,
    completeUnwrap,
    clearTransaction,
  };
}