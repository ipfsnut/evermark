// src/hooks/useBlockchain.ts - Enhanced with better error handling
import { useState, useEffect, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { contractService, formatEther } from '../services/blockchain';
import { TokenBalance, StakeInfo, TransactionState } from '../types';
import { errorLogger } from '../utils/error-logger';

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
      // Fetch all balances in parallel - note we're using the enhanced contract service
      // methods that now have proper error handling with fallbacks
      const [
        nsiBalance,
        stakedBalance,
        votingPower,
        availableVotingPower,
      ] = await Promise.all([
        contractService.getNSIBalance(address).catch(err => {
          errorLogger.log('useBlockchain', err, { method: 'getNSIBalance', address });
          return BigInt(0);
        }),
        contractService.getStakedBalance(address).catch(err => {
          errorLogger.log('useBlockchain', err, { method: 'getStakedBalance', address });
          return BigInt(0);
        }),
        contractService.getVotingPower(address).catch(err => {
          errorLogger.log('useBlockchain', err, { method: 'getVotingPower', address });
          return BigInt(0);
        }),
        contractService.getAvailableVotingPower(address).catch(err => {
          errorLogger.log('useBlockchain', err, { method: 'getAvailableVotingPower', address });
          return BigInt(0);
        }),
      ]);
      
      // Fetch unbonding requests separately since it might not exist yet
      let unbondingRequests: any[] = [];
      try {
        unbondingRequests = await contractService.getUnbondingRequests(address);
      } catch (error) {
        errorLogger.log('useBlockchain', error, { method: 'getUnbondingRequests', address });
        unbondingRequests = [];
      }
      
      // Calculate locked amount
      const lockedAmount = unbondingRequests.reduce((sum, req) => sum + req.amount, BigInt(0));
      
      setState(prev => ({
        ...prev,
        balances: {
          available: nsiBalance,
          staked: stakedBalance,
          votingPower: votingPower,
          locked: lockedAmount,
        },
        stakeInfo: {
          amount: stakedBalance,
          votingPower: availableVotingPower,
          unbondingRequests: unbondingRequests || [],
        },
        loading: false,
      }));
    } catch (error: any) {
      console.error('Failed to refresh balances:', error);
      errorLogger.log('useBlockchain', error, { method: 'refreshBalances', address });
      
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
      errorLogger.log('useBlockchain', error, { method: 'stakeTokens', amount, address });
      
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
      errorLogger.log('useBlockchain', error, { method: 'withdrawTokens', amount, address });
      
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
      errorLogger.log('useBlockchain', error, { method: 'completeUnwrap', requestIndex, address });
      
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