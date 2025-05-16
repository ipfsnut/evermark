// src/hooks/useBlockchain.ts
import { useState, useEffect, useCallback } from 'react';
import { tokenStakingService, UnbondingRequest } from '../services/blockchain';
import { useAuth } from './useAuth';
import { ethers } from 'ethers';

export function useBlockchain() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [nsiBalance, setNsiBalance] = useState<bigint>(BigInt(0));
  const [stakedBalance, setStakedBalance] = useState<bigint>(BigInt(0));
  const [votingPower, setVotingPower] = useState<bigint>(BigInt(0));
  const [availableVotingPower, setAvailableVotingPower] = useState<bigint>(BigInt(0));
  const [unbondingRequests, setUnbondingRequests] = useState<UnbondingRequest[]>([]);
  const [networkStatus, setNetworkStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');
  const { user } = useAuth();

  // Get network status
  const getNetworkStatus = useCallback(() => {
    // Access the network status from the service
    // This requires exposing a method in the TokenStakingService
    // If not available, we can handle it at the hook level
    const status = tokenStakingService.getNetworkStatus ? 
      tokenStakingService.getNetworkStatus() : 
      'connected';
    
    setNetworkStatus(status as 'connected' | 'connecting' | 'error');
    return status;
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

  // Wrap (stake) tokens
  const wrapTokens = useCallback(async (amount: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await tokenStakingService.wrapTokens(amount);
      
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
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchNSIBalance, fetchStakedBalance, fetchVotingPower, fetchAvailableVotingPower]);

  // Request token unwrap (unbonding)
  const requestUnwrap = useCallback(async (amount: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await tokenStakingService.requestUnwrap(amount);
      
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
      const result = await tokenStakingService.completeUnwrap(requestIndex);
      
      // Refresh data after completion
      if (user?.walletAddress) {
        await fetchNSIBalance();
        await fetchUnbondingRequests();
      }
      
      return result;
    } catch (err: any) {
      console.error('Failed to complete unwrap:', err);
      setError(`Failed to complete token unstake: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchNSIBalance, fetchUnbondingRequests]);

  // Format ether for display
  const formatEther = useCallback((value: bigint | string): string => {
    try {
      return ethers.formatEther(value);
    } catch (error) {
      return '0';
    }
  }, []);

  // Parse ether from string
  const parseEther = useCallback((value: string): bigint => {
    try {
      return ethers.parseEther(value);
    } catch (error) {
      return BigInt(0);
    }
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

  return {
    loading,
    error,
    nsiBalance,
    stakedBalance,
    votingPower,
    availableVotingPower,
    unbondingRequests,
    networkStatus,
    fetchNSIBalance,
    fetchStakedBalance,
    fetchVotingPower,
    fetchAvailableVotingPower,
    fetchUnbondingRequests,
    wrapTokens,
    requestUnwrap,
    completeUnwrap,
    formatEther,
    parseEther,
    getNetworkStatus
  };
}