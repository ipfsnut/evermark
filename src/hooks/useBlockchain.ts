// src/hooks/useBlockchain.ts
import { useState, useEffect, useCallback } from 'react';
import { tokenStakingService, UnbondingRequest, formatEther, parseEther } from '../services/blockchain';
import { useAuth } from './useAuth';

export function useBlockchain() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nsiBalance, setNsiBalance] = useState<bigint>(BigInt(0));
  const [stakedBalance, setStakedBalance] = useState<bigint>(BigInt(0));
  const [votingPower, setVotingPower] = useState<bigint>(BigInt(0));
  const [availableVotingPower, setAvailableVotingPower] = useState<bigint>(BigInt(0));
  const [unbondingRequests, setUnbondingRequests] = useState<UnbondingRequest[]>([]);
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const [transaction, setTransaction] = useState<{
    hash: string;
    status: 'pending' | 'success' | 'error';
    error?: string;
  }>({ hash: '', status: 'pending' });
  
  const { user } = useAuth();

  // Get network status
  const getNetworkStatus = useCallback(() => {
    try {
      // Try to access the network status from the service
      const status = tokenStakingService.getNetworkStatus?.();
      if (status) {
        setNetworkStatus(status as 'connected' | 'connecting' | 'error');
        return status;
      }
      return 'connected';
    } catch (err) {
      console.error('Failed to get network status:', err);
      return 'connected';
    }
  }, []);

  // Fetch NSI token balance
  const fetchNSIBalance = useCallback(async (address?: string) => {
    try {
      const userAddress = address || (user?.walletAddress as string);
      
      if (!userAddress) {
        setNsiBalance(BigInt(0));
        return BigInt(0);
      }
      
      const balance = await tokenStakingService.getNSIBalance(userAddress);
      setNsiBalance(balance);
      return balance;
    } catch (err: any) {
      console.error('Failed to fetch NSI balance:', err);
      return BigInt(0);
    }
  }, [user]);

  // Fetch staked balance
  const fetchStakedBalance = useCallback(async (address?: string) => {
    try {
      const userAddress = address || (user?.walletAddress as string);
      
      if (!userAddress) {
        setStakedBalance(BigInt(0));
        return BigInt(0);
      }
      
      const balance = await tokenStakingService.getStakedBalance(userAddress);
      setStakedBalance(balance);
      return balance;
    } catch (err: any) {
      console.error('Failed to fetch staked balance:', err);
      return BigInt(0);
    }
  }, [user]);

  // Fetch voting power
  const fetchVotingPower = useCallback(async (address?: string) => {
    try {
      const userAddress = address || (user?.walletAddress as string);
      
      if (!userAddress) {
        setVotingPower(BigInt(0));
        return BigInt(0);
      }
      
      const power = await tokenStakingService.getVotingPower(userAddress);
      setVotingPower(power);
      return power;
    } catch (err: any) {
      console.error('Failed to fetch voting power:', err);
      return BigInt(0);
    }
  }, [user]);

  // Fetch available voting power
  const fetchAvailableVotingPower = useCallback(async (address?: string) => {
    try {
      const userAddress = address || (user?.walletAddress as string);
      
      if (!userAddress) {
        setAvailableVotingPower(BigInt(0));
        return BigInt(0);
      }
      
      const power = await tokenStakingService.getAvailableVotingPower(userAddress);
      setAvailableVotingPower(power);
      return power;
    } catch (err: any) {
      console.error('Failed to fetch available voting power:', err);
      return BigInt(0);
    }
  }, [user]);

  // Fetch unbonding requests
  const fetchUnbondingRequests = useCallback(async (address?: string) => {
    try {
      const userAddress = address || (user?.walletAddress as string);
      
      if (!userAddress) {
        setUnbondingRequests([]);
        return [];
      }
      
      const requests = await tokenStakingService.getUnbondingRequests(userAddress);
      setUnbondingRequests(requests);
      return requests;
    } catch (err: any) {
      console.error('Failed to fetch unbonding requests:', err);
      return [];
    }
  }, [user]);

  // Wrap tokens (Stake tokens in the UI)
  const wrapTokens = useCallback(async (amount: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Set transaction to pending
      setTransaction({ hash: '', status: 'pending' });
      
      const result = await tokenStakingService.wrapTokens(amount);
      
      // Set transaction details
      setTransaction({ hash: result.hash, status: 'success' });
      
      // Refresh balances after wrapping
      if (user?.walletAddress) {
        await fetchNSIBalance();
        await fetchStakedBalance();
        await fetchVotingPower();
        await fetchAvailableVotingPower();
      }
      
      return result;
    } catch (err: any) {
      console.error('Failed to wrap tokens:', err);
      setError(`Failed to stake tokens: ${err.message}`);
      setTransaction({ hash: '', status: 'error', error: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchNSIBalance, fetchStakedBalance, fetchVotingPower, fetchAvailableVotingPower]);

  // Request token unwrap (Withdraw tokens in the UI)
  const requestUnwrap = useCallback(async (amount: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Set transaction to pending
      setTransaction({ hash: '', status: 'pending' });
      
      const result = await tokenStakingService.requestUnwrap(amount);
      
      // Set transaction details
      setTransaction({ hash: result.hash, status: 'success' });
      
      // Refresh data after request
      if (user?.walletAddress) {
        await fetchStakedBalance();
        await fetchVotingPower();
        await fetchAvailableVotingPower();
        await fetchUnbondingRequests();
      }
      
      return result;
    } catch (err: any) {
      console.error('Failed to request unwrap:', err);
      setError(`Failed to request token unstake: ${err.message}`);
      setTransaction({ hash: '', status: 'error', error: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchStakedBalance, fetchVotingPower, fetchAvailableVotingPower, fetchUnbondingRequests]);

  // Complete unwrap (after unbonding period)
  const completeUnwrap = useCallback(async (requestIndex: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // Set transaction to pending
      setTransaction({ hash: '', status: 'pending' });
      
      const result = await tokenStakingService.completeUnwrap(requestIndex);
      
      // Set transaction details
      setTransaction({ hash: result.hash, status: 'success' });
      
      // Refresh data after completion
      if (user?.walletAddress) {
        await fetchNSIBalance();
        await fetchUnbondingRequests();
      }
      
      return result;
    } catch (err: any) {
      console.error('Failed to complete unwrap:', err);
      setError(`Failed to complete token unstake: ${err.message}`);
      setTransaction({ hash: '', status: 'error', error: err.message });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchNSIBalance, fetchUnbondingRequests]);

  // Clear transaction
  const clearTransaction = useCallback(() => {
    setTransaction({ hash: '', status: 'pending' });
  }, []);

  // Initialize with user's data
  useEffect(() => {
    if (user?.walletAddress) {
      fetchNSIBalance();
      fetchStakedBalance();
      fetchVotingPower();
      fetchAvailableVotingPower();
      fetchUnbondingRequests();
    }
    
    getNetworkStatus();
  }, [user, fetchNSIBalance, fetchStakedBalance, fetchVotingPower, fetchAvailableVotingPower, fetchUnbondingRequests, getNetworkStatus]);

  // Calculate total locked balance from unbonding requests
  const lockedBalance = unbondingRequests.reduce((total, request) => total + request.amount, BigInt(0));

  // Return the shape that the frontend expects
  return {
    loading,
    error,
    // Structured balances object expected by ProfilePage
    balances: {
      available: nsiBalance,
      staked: stakedBalance,
      votingPower: votingPower,
      locked: lockedBalance
    },
    // Structured stake info expected by the frontend
    stakeInfo: {
      unbondingRequests: unbondingRequests
    },
    // The frontend expects these function names
    stakeTokens: wrapTokens,
    withdrawTokens: requestUnwrap,
    completeUnwrap,
    transaction,
    clearTransaction,
    
    // Keep the original raw data available too
    nsiBalance,
    stakedBalance,
    votingPower,
    availableVotingPower,
    networkStatus,
    
    // Raw methods for new components that might use them
    fetchNSIBalance,
    fetchStakedBalance,
    fetchVotingPower,
    fetchAvailableVotingPower,
    fetchUnbondingRequests,
    getNetworkStatus,
    
    // Format and parse methods
    formatEther,
    parseEther
  };
}