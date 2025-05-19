// src/pages/ProfilePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useBlockchain } from '../hooks/useBlockchain';
import { RewardsPanel } from '../components/rewards/RewardsPanel';
import { VotePowerAllocation } from '../components/voting/VotePowerAllocation';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionContainer } from '../components/layout/SectionContainer';
import { StyledButton } from '../components/forms/StyledButton';
import { StyledInput } from '../components/forms/StyledInput';
import { StatusMessage } from '../components/forms/StatusMessage';
import {
  UserIcon,
  WalletIcon,
  CoinsIcon,
  StarsIcon,
  TrendingUpIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CopyIcon,
  CheckCircleIcon,
  EditIcon,
  DownloadIcon,
  ClockIcon,
  InfoIcon
} from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, signOut } = useAuth();
  const {
    balances,
    stakeInfo,
    stakeTokens,
    withdrawTokens,
    completeUnwrap,
    transaction,
    clearTransaction,
    formatEther,
  } = useBlockchain();

  // State for forms
  const [stakeAmount, setStakeAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showStakeForm, setShowStakeForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  
  // State for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  
  // State for validation
  const [stakeError, setStakeError] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  
  // State for tracking specific operations
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isClaiming, setIsClaiming] = useState<number | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);

  // Initialize username from user data
  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user]);

  // Effect to handle transaction completion
  useEffect(() => {
    if (transaction.status === 'success') {      
      // Reset operation states
      setIsStaking(false);
      setIsWithdrawing(false);
      setIsClaiming(null);
      
      // Clear transaction after display period
      const timer = setTimeout(() => {
        clearTransaction();
      }, 5000);
      
      return () => clearTimeout(timer);
    } else if (transaction.status === 'error') {
      // Reset operation states on error
      setIsStaking(false);
      setIsWithdrawing(false);
      setIsClaiming(null);
    }
  }, [transaction.status, clearTransaction]);

  // Handle staking with validation
  const handleStake = async () => {
    // Reset error state
    setStakeError(null);
    clearTransaction();
    
    // Validate amount
    if (!stakeAmount) {
      setStakeError('Please enter an amount to stake');
      return;
    }
    
    const amount = parseFloat(stakeAmount);
    // Ensure we're using Number type for comparison
    const availableAmount = Number(formatEther(balances.available));
    
    if (isNaN(amount) || amount <= 0) {
      setStakeError('Please enter a valid positive amount');
      return;
    }
    
    if (amount > availableAmount) {
      setStakeError(`You only have ${availableAmount.toFixed(2)} tokens available`);
      return;
    }
    
    try {
      setIsStaking(true);
      await stakeTokens(stakeAmount);
      // Form will be hidden by the transaction effect if successful
    } catch (error: any) {
      setStakeError(error.message || 'Failed to stake tokens');
      setIsStaking(false);
    }
  };

  // Handle withdrawal with validation
  const handleWithdraw = async () => {
    setWithdrawError(null);
    clearTransaction();
    
    if (!withdrawAmount) {
      setWithdrawError('Please enter an amount to withdraw');
      return;
    }
    
    const amount = parseFloat(withdrawAmount);
    // Ensure we're using Number type for comparison
    const stakedAmount = Number(formatEther(balances.staked));
    
    if (isNaN(amount) || amount <= 0) {
      setWithdrawError('Please enter a valid positive amount');
      return;
    }
    
    if (amount > stakedAmount) {
      setWithdrawError(`You only have ${stakedAmount.toFixed(2)} tokens staked`);
      return;
    }
    
    try {
      setIsWithdrawing(true);
      
      // Ensure we're passing a clean string value that can be properly 
      // converted to BigInt in the tokenStakingService
      const cleanAmount = amount.toString();
      await withdrawTokens(cleanAmount);
    } catch (error: any) {
      setWithdrawError(error.message || 'Failed to request withdrawal');
      setIsWithdrawing(false);
    }
  };

  // Handle claiming unbonded tokens
  const handleClaimUnbonded = async (index: number) => {
    clearTransaction();
    try {
      setIsClaiming(index);
      await completeUnwrap(index);
      // State will be reset by the transaction effect
    } catch (error: any) {
      console.error('Failed to claim tokens:', error);
      setIsClaiming(null);
    }
  };

  // Copy wallet address to clipboard
  const copyAddress = useCallback(() => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  }, [user?.walletAddress]);
  
  // Handle profile update
  const handleProfileUpdate = async () => {
    setEditError(null);
    
    if (!username.trim()) {
      setEditError('Username cannot be empty');
      return;
    }
    
    // This would be implemented with a proper updateUserProfile function
    try {
      // Simulate profile update
      console.log('Updating profile:', { username });
      // await updateUserProfile({ username });
      setIsEditing(false);
    } catch (error: any) {
      setEditError(error.message || 'Failed to update profile');
    }
  };
  
  // Handle data export
  const handleExportData = () => {
    const profileData = {
      user: {
        id: user?.id,
        username: user?.username,
        walletAddress: user?.walletAddress,
        createdAt: user?.createdAt
      },
      balances: {
        available: formatEther(balances.available),
        staked: formatEther(balances.staked),
        votingPower: formatEther(balances.votingPower),
        locked: formatEther(balances.locked)
      },
      unbondingRequests: stakeInfo.unbondingRequests.map(req => ({
        // Ensure amount is safely converted
        amount: formatEther(typeof req.amount === 'bigint' ? req.amount : BigInt(String(req.amount || 0))),
        // Ensure releaseTime is properly converted to a timestamp
        releaseTime: new Date(
          typeof req.releaseTime === 'bigint' 
            ? Number(req.releaseTime) 
            : (typeof req.releaseTime === 'number' 
                ? req.releaseTime 
                : Number(req.releaseTime || 0)) 
          * 1000
        ).toISOString()
      }))
    };
    
    // Create a downloadable JSON file
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(profileData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `evermark-profile-${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Reset forms when hiding them
  const hideStakeForm = () => {
    setShowStakeForm(false);
    setStakeError(null);
    setStakeAmount('');
  };

  const hideWithdrawForm = () => {
    setShowWithdrawForm(false);
    setWithdrawError(null);
    setWithdrawAmount('');
  };

  if (!isAuthenticated || !user) {
    return (
      <PageContainer
        title="Profile"
        description="Connect your wallet to view and manage your profile."
        icon={<UserIcon className="h-7 w-7 text-warpcast" />}
      >
        <div className="text-center py-12 bg-parchment-texture rounded-lg">
          <UserIcon className="mx-auto h-12 w-12 text-wood opacity-60 mb-4" />
          <p className="text-ink-light font-serif leading-relaxed">
            Please connect your wallet to view your profile.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Account Profile"
      description="Manage your account settings, tokens, and staking"
      icon={<UserIcon className="h-7 w-7 text-warpcast" />}
    >
      {/* Profile Information Section */}
      <SectionContainer title="Profile Information" className="mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-16 h-16 rounded-full bg-warpcast/10 flex items-center justify-center mr-4">
              <UserIcon className="h-8 w-8 text-warpcast" />
            </div>
            
            {isEditing ? (
              <div>
                <StyledInput
                  id="username"
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  error={editError || undefined}
                  required
                  containerClassName="mb-0 w-64"
                />
              </div>
            ) : (
              <div>
                <h2 className="text-responsive-subtitle text-ink-dark font-serif">
                  {user.username || 'Anonymous User'}
                </h2>
                <div className="flex items-center text-sm text-ink-light font-mono">
                  <WalletIcon className="w-4 h-4 mr-1" />
                  <span>{user.walletAddress?.slice(0, 6)}...{user.walletAddress?.slice(-4)}</span>
                  <button 
                    onClick={copyAddress} 
                    className="ml-2 p-1 hover:bg-parchment rounded transition-colors"
                    aria-label="Copy wallet address"
                  >
                    {addressCopied ? (
                      <CheckCircleIcon className="w-3 h-3 text-green-600" />
                    ) : (
                      <CopyIcon className="w-3 h-3 text-warpcast" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <StyledButton
                  onClick={handleProfileUpdate}
                  variant="primary"
                  size="sm"
                >
                  Save Changes
                </StyledButton>
                <StyledButton
                  onClick={() => {
                    setIsEditing(false);
                    setEditError(null);
                    if (user?.username) setUsername(user.username);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  Cancel
                </StyledButton>
              </>
            ) : (
              <>
                <StyledButton
                  onClick={() => setIsEditing(true)}
                  variant="secondary"
                  size="sm"
                  icon={<EditIcon className="h-4 w-4" />}
                >
                  Edit Profile
                </StyledButton>
                <StyledButton
                  onClick={handleExportData}
                  variant="secondary"
                  size="sm"
                  icon={<DownloadIcon className="h-4 w-4" />}
                >
                  Export Data
                </StyledButton>
                <StyledButton
                  onClick={signOut}
                  variant="tertiary"
                  size="sm"
                >
                  Sign Out
                </StyledButton>
              </>
            )}
          </div>
        </div>
      </SectionContainer>

      {/* Balances Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-parchment-texture p-6 rounded-lg shadow-md border border-wood-light/30 animate-text-in" style={{animationDelay: "0.1s"}}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warpcast/10 mr-4">
              <CoinsIcon className="h-6 w-6 text-warpcast" />
            </div>
            <div>
              <p className="text-sm font-serif font-medium text-ink-light tracking-tight">Available Tokens</p>
              <p className="text-2xl font-serif font-bold text-ink-dark tracking-tight">
                {formatEther(balances.available)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-parchment-texture p-6 rounded-lg shadow-md border border-wood-light/30 animate-text-in" style={{animationDelay: "0.2s"}}>
          <div className="flex items-center">
                        <div className="p-3 rounded-full bg-warpcast/10 mr-4">
              <StarsIcon className="h-6 w-6 text-warpcast" />
            </div>
            <div>
              <p className="text-sm font-serif font-medium text-ink-light tracking-tight">Staked Tokens</p>
              <p className="text-2xl font-serif font-bold text-ink-dark tracking-tight">
                {formatEther(balances.staked)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-parchment-texture p-6 rounded-lg shadow-md border border-wood-light/30 animate-text-in" style={{animationDelay: "0.3s"}}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warpcast/10 mr-4">
              <TrendingUpIcon className="h-6 w-6 text-warpcast" />
            </div>
            <div>
              <p className="text-sm font-serif font-medium text-ink-light tracking-tight">Voting Power</p>
              <p className="text-2xl font-serif font-bold text-ink-dark tracking-tight">
                {formatEther(balances.votingPower)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-parchment-texture p-6 rounded-lg shadow-md border border-wood-light/30 animate-text-in" style={{animationDelay: "0.4s"}}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warpcast/10 mr-4">
              <ArrowDownIcon className="h-6 w-6 text-warpcast" />
            </div>
            <div>
              <p className="text-sm font-serif font-medium text-ink-light tracking-tight">Unbonding Tokens</p>
              <p className="text-2xl font-serif font-bold text-ink-dark tracking-tight">
                {formatEther(balances.locked)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tokens & Staking Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Staking Actions */}
        <SectionContainer title="Token Actions" className="h-full">
          {/* Transaction Status */}
          {transaction.hash && (
            <StatusMessage
              type={transaction.status === 'success' ? 'success' : 'error'}
              message={
                transaction.status === 'success' 
                  ? 'Transaction confirmed!' 
                  : transaction.status === 'pending' 
                    ? 'Transaction pending...'
                    : 'Transaction failed'
              }
              subMessage={transaction.status === 'success' 
                ? `Transaction hash: ${transaction.hash.slice(0, 8)}...${transaction.hash.slice(-8)}`
                : transaction.error || undefined
              }
              className="mb-4"
            />
          )}
          
          <div className="flex flex-col gap-4">
            {/* Stake Form */}
            {showStakeForm ? (
              <div className="p-4 bg-parchment-light rounded-lg border border-wood-light/30">
                <h3 className="font-serif font-medium text-ink-dark mb-3 flex items-center">
                  <ArrowUpIcon className="h-4 w-4 mr-2 text-warpcast" />
                  Stake Tokens
                </h3>
                
                <StyledInput
                  id="stake-amount"
                  label="Amount to Stake"
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder={`Available: ${formatEther(balances.available)}`}
                  error={stakeError || undefined}
                  required
                />
                
                <div className="flex justify-end space-x-3 mt-4">
                  <StyledButton
                    onClick={hideStakeForm}
                    variant="tertiary"
                    size="sm"
                    disabled={isStaking}
                  >
                    Cancel
                  </StyledButton>
                  <StyledButton
                    onClick={handleStake}
                    variant="primary"
                    size="sm"
                    isLoading={isStaking}
                    disabled={isStaking}
                  >
                    Stake Tokens
                  </StyledButton>
                </div>
              </div>
            ) : (
              <StyledButton
                onClick={() => {
                  setShowStakeForm(true);
                  setShowWithdrawForm(false);
                  setWithdrawError(null);
                }}
                variant="primary"
                icon={<ArrowUpIcon className="h-4 w-4" />}
                className="w-full"
                disabled={isStaking || isWithdrawing}
              >
                Stake Tokens
              </StyledButton>
            )}
            
            {/* Withdraw Form */}
            {showWithdrawForm ? (
              <div className="p-4 bg-parchment-light rounded-lg border border-wood-light/30">
                <h3 className="font-serif font-medium text-ink-dark mb-3 flex items-center">
                  <ArrowDownIcon className="h-4 w-4 mr-2 text-warpcast" />
                  Request Withdrawal
                </h3>
                
                <StyledInput
                  id="withdraw-amount"
                  label="Amount to Withdraw"
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Staked: ${formatEther(balances.staked)}`}
                  error={withdrawError || undefined}
                  required
                />
                
                <div className="mt-3 p-3 bg-parchment rounded-md">
                  <p className="text-xs font-serif text-ink-light">
                    <InfoIcon className="inline-block h-3 w-3 mr-1 text-warpcast" />
                    Withdrawals have a 7-day unbonding period. You won't be able to claim tokens until the period ends.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 mt-4">
                  <StyledButton
                    onClick={hideWithdrawForm}
                    variant="tertiary"
                    size="sm"
                    disabled={isWithdrawing}
                  >
                    Cancel
                  </StyledButton>
                  <StyledButton
                    onClick={handleWithdraw}
                    variant="primary"
                    size="sm"
                    isLoading={isWithdrawing}
                    disabled={isWithdrawing}
                  >
                    Request Withdrawal
                  </StyledButton>
                </div>
              </div>
            ) : (
              <StyledButton
                onClick={() => {
                  setShowWithdrawForm(true);
                  setShowStakeForm(false);
                  setStakeError(null);
                }}
                variant="secondary"
                icon={<ArrowDownIcon className="h-4 w-4" />}
                className="w-full"
                disabled={isStaking || isWithdrawing}
              >
                Withdraw Tokens
              </StyledButton>
            )}
          </div>
        </SectionContainer>
        
        {/* Rewards Panel */}
        <RewardsPanel />
      </div>

      {/* Unbonding Requests - with BigInt fixes */}
      {stakeInfo.unbondingRequests && stakeInfo.unbondingRequests.length > 0 && (
        <SectionContainer title="Unbonding Requests" className="mb-6">
          <div className="space-y-3">
            {stakeInfo.unbondingRequests.map((request, index) => {
              // Current time in seconds
              const now = Math.floor(Date.now() / 1000);
              
              // Safe conversion of releaseTime to a number for calculations
              let releaseTimeNum: number;
              
              if (typeof request.releaseTime === 'bigint') {
                releaseTimeNum = Number(request.releaseTime);
              } else if (typeof request.releaseTime === 'number') {
                releaseTimeNum = request.releaseTime;
              } else if (typeof request.releaseTime === 'string') {
                releaseTimeNum = parseInt(request.releaseTime, 10) || 0;
              } else {
                // Fallback for undefined or null
                releaseTimeNum = 0;
              }
              
              // Determine if the request is available for claiming
              const isAvailable = releaseTimeNum <= now;
              
              // Calculate time remaining (prevent negative values)
              const timeRemaining = Math.max(0, releaseTimeNum - now);
              
              // Calculate days, hours, minutes remaining
              const days = Math.floor(timeRemaining / 86400);
              const hours = Math.floor((timeRemaining % 86400) / 3600);
              const minutes = Math.floor((timeRemaining % 3600) / 60);
              
              // Format time remaining text
              let timeRemainingText = '';
              if (days > 0) {
                timeRemainingText = `${days}d ${hours}h remaining`;
              } else if (hours > 0) {
                timeRemainingText = `${hours}h ${minutes}m remaining`;
              } else if (minutes > 0) {
                timeRemainingText = `${minutes}m remaining`;
              } else if (timeRemaining > 0) {
                timeRemainingText = 'less than a minute remaining';
              }
              
              // Safe conversion of amount for display
              const amountToDisplay = typeof request.amount === 'bigint'
                ? formatEther(request.amount)
                : formatEther(BigInt(String(request.amount || 0)));
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-parchment-light rounded-lg border border-wood-light/30">
                  <div>
                    <div className="flex items-center font-serif">
                      <span className="text-lg font-medium text-ink-dark">{amountToDisplay} NSI</span>
                      {isAvailable && (
                        <span className="ml-2 text-xs text-green-600 flex items-center">
                          <CheckCircleIcon className="h-3 w-3 mr-1" /> Ready to claim
                        </span>
                      )}
                    </div>
                    
                    {isAvailable ? (
                      <div className="text-sm text-ink-light">
                        Available since {new Date(releaseTimeNum * 1000).toLocaleDateString()}
                      </div>
                    ) : (
                      <div className="text-sm text-ink-light flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {timeRemainingText}
                      </div>
                    )}
                  </div>
                  
                  {isAvailable && (
                    <StyledButton
                      onClick={() => handleClaimUnbonded(index)}
                      variant="primary"
                      size="sm"
                      isLoading={isClaiming === index}
                      disabled={isClaiming !== null}
                    >
                      Claim Tokens
                    </StyledButton>
                  )}
                </div>
              );
            })}
          </div>
        </SectionContainer>
      )}

      {/* Voting Power Allocation */}
      <VotePowerAllocation />
    </PageContainer>
  );
};

export default ProfilePage;

