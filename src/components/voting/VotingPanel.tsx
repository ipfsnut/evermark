// src/components/voting/VotingPanel.tsx
import React, { useState, useEffect } from 'react';
import { useVoting } from '../../hooks/useVoting';
import { useBlockchain } from '../../hooks/useBlockchain';
import { formatEther, parseEther } from '../../services/blockchain';
import { 
  VoteIcon, 
  TrendingUpIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon
} from 'lucide-react';
import { StatusMessage } from '../forms/StatusMessage';
import { StyledButton } from '../forms/StyledButton';

interface VotingPanelProps {
  evermarkId: string;
  isOwner: boolean;
}

export const VotingPanel: React.FC<VotingPanelProps> = ({ evermarkId, isOwner }) => {
  const { 
    votes, 
    userVotes, 
    cycle,
    timeRemaining,
    loading, 
    votingLoading, 
    error, 
    votingError,
    getBookmarkVotes,
    getUserVotes,
    voteOnBookmark,
    removeVotes,
    fetchCycleInfo
  } = useVoting();
  
  const { balances } = useBlockchain();
  
  const [voteAmount, setVoteAmount] = useState('');
  const [removeAmount, setRemoveAmount] = useState('');
  const [showRemoveForm, setShowRemoveForm] = useState(false);

  // Load voting data
  useEffect(() => {
    if (evermarkId) {
      getBookmarkVotes(evermarkId);
      getUserVotes(evermarkId);
      fetchCycleInfo();
    }
  }, [evermarkId, getBookmarkVotes, getUserVotes, fetchCycleInfo]);

  // Format time remaining
  const formatTimeRemaining = (seconds: number): string => {
    if (seconds <= 0) return 'Cycle ending...';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m ${seconds % 60}s remaining`;
    }
  };

  // Handle voting
  const handleVote = async () => {
    if (!voteAmount) return;
    await voteOnBookmark(evermarkId, voteAmount);
    setVoteAmount('');
  };

  // Handle vote removal
  const handleRemoveVotes = async () => {
    if (!removeAmount) return;
    await removeVotes(evermarkId, removeAmount);
    setRemoveAmount('');
    setShowRemoveForm(false);
  };

  // Calculate percentages for progress bar
  const totalUserPower = Number(formatEther(balances.votingPower));
  const votedAmount = Number(formatEther(userVotes));
  const votedPercentage = totalUserPower > 0 ? (votedAmount / totalUserPower) * 100 : 0;

  return (
    <div className="bg-parchment-texture rounded-lg shadow-md p-6 border border-wood-light/30 mt-6">
      <h2 className="text-responsive-subtitle text-ink-dark font-serif mb-4 flex items-center">
        <VoteIcon className="h-5 w-5 mr-2 text-warpcast" />
        Vote on this Evermark
      </h2>
      
      {/* Cycle Information */}
      <div className="flex items-center justify-between mb-4 bg-warpcast/5 p-3 rounded-md">
        <div className="flex items-center">
          <ClockIcon className="h-4 w-4 mr-2 text-warpcast" />
          <span className="text-sm font-serif">Voting Cycle #{cycle}</span>
        </div>
        <div className="text-sm font-serif text-ink-light">
          {formatTimeRemaining(timeRemaining)}
        </div>
      </div>
      
      {/* Vote Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm font-serif mb-1">
          <span className="text-ink-dark">Your Votes</span>
          <span className="text-ink-light">{votedAmount} / {totalUserPower} voting power</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-warpcast rounded-full"
            style={{ width: `${Math.min(votedPercentage, 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* Vote Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-wood-texture p-4 rounded-lg text-center relative">
          <div className="absolute inset-0 bg-black bg-opacity-70 rounded-lg"></div>
          <div className="relative z-10">
            <p className="text-xs text-parchment-light/80 mb-1">Total Votes</p>
            <p className="text-xl font-serif font-bold text-parchment-light">
              {loading ? (
                <span className="block w-16 h-6 bg-parchment-light/20 rounded animate-pulse mx-auto"></span>
              ) : (
                formatEther(votes)
              )}
            </p>
          </div>
        </div>
        
        <div className="bg-wood-texture p-4 rounded-lg text-center relative">
          <div className="absolute inset-0 bg-black bg-opacity-70 rounded-lg"></div>
          <div className="relative z-10">
            <p className="text-xs text-parchment-light/80 mb-1">Your Contribution</p>
            <p className="text-xl font-serif font-bold text-parchment-light">
              {loading ? (
                <span className="block w-16 h-6 bg-parchment-light/20 rounded animate-pulse mx-auto"></span>
              ) : (
                formatEther(userVotes)
              )}
            </p>
          </div>
        </div>
      </div>
      
      {/* Error Messages */}
      {error && (
        <StatusMessage
          type="error"
          message="Failed to load voting information"
          subMessage={error}
          className="mb-4"
        />
      )}
      
      {votingError && (
        <StatusMessage
          type="error"
          message="Voting failed"
          subMessage={votingError}
          className="mb-4"
        />
      )}
      
      {/* Voting Form */}
      {!isOwner && !showRemoveForm && (
        <div className="flex items-center gap-4 mb-4">
          <input
            type="number"
            value={voteAmount}
            onChange={(e) => setVoteAmount(e.target.value)}
            placeholder="Amount to vote"
            className="flex-1 px-3 py-2 font-serif bg-parchment-light bg-opacity-80 border border-wood-light rounded-md focus:outline-none focus:ring-2 focus:ring-warpcast/40"
            min="0"
            step="0.01"
          />
          <StyledButton
            onClick={handleVote}
            disabled={votingLoading || !voteAmount}
            variant="primary"
            size="md"
            isLoading={votingLoading}
            icon={<ArrowUpIcon className="h-4 w-4" />}
          >
            Vote
          </StyledButton>
        </div>
      )}
      
      {/* Remove Votes Form */}
      {!isOwner && showRemoveForm && (
        <div className="flex items-center gap-4 mb-4">
          <input
            type="number"
            value={removeAmount}
            onChange={(e) => setRemoveAmount(e.target.value)}
            placeholder="Amount to remove"
            className="flex-1 px-3 py-2 font-serif bg-parchment-light bg-opacity-80 border border-wood-light rounded-md focus:outline-none focus:ring-2 focus:ring-warpcast/40"
            min="0"
            max={formatEther(userVotes)}
            step="0.01"
          />
          <StyledButton
            onClick={handleRemoveVotes}
            disabled={votingLoading || !removeAmount}
            variant="danger"
            size="md"
            isLoading={votingLoading}
            icon={<ArrowDownIcon className="h-4 w-4" />}
          >
            Remove
          </StyledButton>
        </div>
      )}
      
      {/* Toggle Remove/Vote Form */}
      {!isOwner && Number(formatEther(userVotes)) > 0 && (
        <div className="text-center">
          <button
            onClick={() => setShowRemoveForm(!showRemoveForm)}
            className="text-sm font-serif text-warpcast hover:text-warpcast-dark transition-colors"
          >
            {showRemoveForm ? 'Back to Voting' : 'Remove Some Votes Instead'}
          </button>
        </div>
      )}
      
      {/* Owner Message */}
      {isOwner && (
        <div className="text-center py-3 bg-wood-light/10 rounded-lg">
          <p className="text-sm font-serif text-ink-light">
            <span className="text-green-600 mr-1">✓</span>
            You own this Evermark and cannot vote on it
          </p>
        </div>
      )}
    </div>
  );
};