// src/components/rewards/RewardsPanel.tsx
import React, { useEffect } from 'react';
import { useRewards } from '../../hooks/useRewards';
import { formatEther } from '../../services/blockchain';
import { StyledButton } from '../forms/StyledButton';
import { StatusMessage } from '../forms/StatusMessage';
import { SparklesIcon, RefreshCwIcon } from 'lucide-react';

export const RewardsPanel: React.FC = () => {
  const {
    pendingRewards,
    loading,
    claimLoading,
    error,
    claimError,
    claimSuccess,
    fetchPendingRewards,
    claimRewards,
    updateStakingPower,
  } = useRewards();
  
  useEffect(() => {
    fetchPendingRewards();
  }, [fetchPendingRewards]);
  
  const handleClaimRewards = async () => {
    await claimRewards();
  };
  
  const handleUpdateStakingPower = async () => {
    await updateStakingPower();
  };
  
  return (
    <div className="bg-parchment-texture rounded-lg shadow-md p-6 border border-wood-light/30 animate-text-in">
      <h2 className="text-responsive-subtitle text-ink-dark font-serif mb-4 flex items-center">
        <SparklesIcon className="h-5 w-5 mr-2 text-warpcast" />
        Evermark Rewards
      </h2>
      
      {error && (
        <StatusMessage
          type="error"
          message="Failed to load rewards"
          subMessage={error}
          className="mb-4"
        />
      )}
      
      {claimError && (
        <StatusMessage
          type="error"
          message="Failed to claim rewards"
          subMessage={claimError}
          className="mb-4"
        />
      )}
      
      {claimSuccess && (
        <StatusMessage
          type="success"
          message="Rewards claimed successfully!"
          className="mb-4"
        />
      )}
      
      <div className="mb-6 p-4 bg-wood-texture text-parchment-light rounded-lg overflow-hidden relative">
        <div className="absolute inset-0 bg-black bg-opacity-70 dark:bg-opacity-80 z-0"></div>
        <div className="relative z-10">
          <div className="text-sm text-parchment-light/80 mb-1">Pending Rewards</div>
          <div className="text-3xl font-serif font-bold">
            {loading ? (
              <div className="h-8 bg-parchment-light/20 rounded w-24 animate-pulse"></div>
            ) : (
              <div className="flex items-center">
                <span>{formatEther(pendingRewards)}</span>
                <span className="ml-2 text-sm opacity-80">NSI</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <StyledButton
          onClick={handleClaimRewards}
          disabled={claimLoading || loading || pendingRewards <= BigInt(0)}
          isLoading={claimLoading}
          variant="primary"
          className="flex-1"
        >
          Claim Rewards
        </StyledButton>
        
        <StyledButton
          onClick={handleUpdateStakingPower}
          disabled={loading}
          isLoading={loading && !claimLoading}
          variant="secondary"
          className="flex-1"
          icon={<RefreshCwIcon className="h-4 w-4" />}
        >
          Update Staking Power
        </StyledButton>
      </div>
    </div>
  );
};