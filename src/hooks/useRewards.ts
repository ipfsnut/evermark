// src/hooks/useRewards.ts
import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { evermarkRewardsService } from '../services/blockchain';
import { errorLogger } from '../utils/error-logger';

export function useRewards() {
  const { address, isConnected } = useAccount();
  const [pendingRewards, setPendingRewards] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState<boolean>(false);
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<boolean>(false);
  
  // Fetch pending rewards
  const fetchPendingRewards = useCallback(async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const rewards = await evermarkRewardsService.getPendingRewards(address);
      setPendingRewards(rewards);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch rewards';
      errorLogger.log('useRewards', err, { method: 'fetchPendingRewards', address });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [address]);
  
  // Claim rewards
  const claimRewards = useCallback(async () => {
    if (!address) return false;
    
    setClaimLoading(true);
    setClaimError(null);
    setClaimSuccess(false);
    
    try {
      const { wait } = await evermarkRewardsService.claimRewards();
      await wait();
      
      // Refresh rewards after successful claim
      await fetchPendingRewards();
      setClaimSuccess(true);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to claim rewards';
      errorLogger.log('useRewards', err, { method: 'claimRewards', address });
      setClaimError(errorMessage);
      return false;
    } finally {
      setClaimLoading(false);
    }
  }, [address, fetchPendingRewards]);
  
  // Update staking power (to ensure rewards are calculated correctly)
  const updateStakingPower = useCallback(async () => {
    if (!address) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const { wait } = await evermarkRewardsService.updateStakingPower();
      await wait();
      
      // Refresh rewards after updating staking power
      await fetchPendingRewards();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update staking power';
      errorLogger.log('useRewards', err, { method: 'updateStakingPower', address });
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, [address, fetchPendingRewards]);
  
  return {
    pendingRewards,
    loading,
    claimLoading,
    error,
    claimError,
    claimSuccess,
    fetchPendingRewards,
    claimRewards,
    updateStakingPower,
  };
}
