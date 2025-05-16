// src/hooks/useRewards.ts
import { useState, useEffect, useCallback } from 'react';
import { evermarkRewardsService } from '../services/blockchain';
import { useAuth } from './useAuth';
import { ethers } from 'ethers';

export function useRewards() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRewards, setPendingRewards] = useState<bigint>(BigInt(0));
  const { user } = useAuth();

  // Fetch pending rewards
  const fetchPendingRewards = useCallback(async (address?: string) => {
    try {
      const userAddress = address || (user?.walletAddress as string);
      
      if (!userAddress) {
        setPendingRewards(BigInt(0));
        return BigInt(0);
      }
      
      const rewards = await evermarkRewardsService.getPendingRewards(userAddress);
      setPendingRewards(rewards);
      return rewards;
    } catch (err: any) {
      console.error('Failed to fetch pending rewards:', err);
      return BigInt(0);
    }
  }, [user]);

  // Claim rewards
  const claimRewards = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await evermarkRewardsService.claimRewards();
      
      // Refresh pending rewards after claiming
      if (user?.walletAddress) {
        await fetchPendingRewards();
      }
      
      return result;
    } catch (err: any) {
      console.error('Failed to claim rewards:', err);
      setError(`Failed to claim rewards: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchPendingRewards]);

  // Update staking power
  const updateStakingPower = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await evermarkRewardsService.updateStakingPower();
      
      // Refresh pending rewards after update
      if (user?.walletAddress) {
        await fetchPendingRewards();
      }
      
      return result;
    } catch (err: any) {
      console.error('Failed to update staking power:', err);
      setError(`Failed to update staking power: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, fetchPendingRewards]);

  // Format ether for display
  const formatEther = useCallback((value: bigint | string): string => {
    try {
      return ethers.formatEther(value);
    } catch (error) {
      return '0';
    }
  }, []);

  // Initialize with user's pending rewards
  useEffect(() => {
    if (user?.walletAddress) {
      fetchPendingRewards();
    }
  }, [user, fetchPendingRewards]);

  return {
    loading,
    error,
    pendingRewards,
    fetchPendingRewards,
    claimRewards,
    updateStakingPower,
    formatEther
  };
}