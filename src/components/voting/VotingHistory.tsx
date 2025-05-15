// src/components/voting/VotingHistory.tsx
import React, { useState, useEffect } from 'react';
import { useVoting } from '../../hooks/useVoting';
import { formatEther } from '../../services/blockchain';
import { HistoryIcon, ArrowUpIcon, TrendingUpIcon } from 'lucide-react';

interface VotingHistoryProps {
  evermarkId: string;
}

// This would ideally come from an API/contract call
interface VoteEvent {
  voter: string;
  amount: string;
  timestamp: Date;
  type: 'add' | 'remove';
}

export const VotingHistory: React.FC<VotingHistoryProps> = ({ evermarkId }) => {
  const [voteEvents, setVoteEvents] = useState<VoteEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { votes } = useVoting();
  
  // Simulated data - in reality, you would fetch this from an API or contract events
  useEffect(() => {
    const fetchVoteHistory = async () => {
      setLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data - replace with actual API/contract call
        const mockEvents: VoteEvent[] = [
          {
            voter: '0x7a16ff8270133f063aab6c9977183d9e72835428',
            amount: '1.5',
            timestamp: new Date(Date.now() - 3600000),
            type: 'add'
          },
          {
            voter: '0x3b9e571eff804f4e11ea817c77d46f4b05862b3e',
            amount: '2.3',
            timestamp: new Date(Date.now() - 7200000),
            type: 'add'
          },
          {
            voter: '0x7a16ff8270133f063aab6c9977183d9e72835428',
            amount: '0.5',
            timestamp: new Date(Date.now() - 14400000),
            type: 'remove'
          },
          {
            voter: '0x921836caa85e32c994ff2f06c234a75bfbfa6b10',
            amount: '3.1',
            timestamp: new Date(Date.now() - 86400000),
            type: 'add'
          }
        ];
        
        setVoteEvents(mockEvents);
      } catch (error) {
        console.error('Failed to fetch vote history:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVoteHistory();
  }, [evermarkId]);

  // Format wallet address
  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-serif font-medium text-ink-dark mb-4 flex items-center">
        <HistoryIcon className="h-5 w-5 mr-2 text-warpcast" />
        Voting History
      </h3>
      
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-parchment-light animate-pulse p-4 rounded-lg">
              <div className="h-5 bg-wood-light/20 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-wood-light/20 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : voteEvents.length > 0 ? (
        <div className="space-y-3">
          {voteEvents.map((event, index) => (
            <div key={index} className="bg-parchment-light p-4 rounded-lg border border-wood-light/20 animate-text-in" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  {event.type === 'add' ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-600 mr-2" />
                  ) : (
                    <ArrowUpIcon className="h-4 w-4 text-red-600 mr-2 transform rotate-180" />
                  )}
                  <span className="font-serif font-medium text-ink-dark">
                    {formatAddress(event.voter)}
                  </span>
                </div>
                <span className="text-sm font-serif text-ink-light">
                  {event.timestamp.toLocaleString()}
                </span>
              </div>
              <p className="mt-1 font-serif text-ink-dark">
                {event.type === 'add' ? 'Added' : 'Removed'} <span className="font-medium">{event.amount}</span> votes
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 bg-parchment-light rounded-lg border border-wood-light/20">
          <p className="font-serif text-ink-light">No voting activity yet</p>
        </div>
      )}
      
      <div className="mt-4 p-4 bg-warpcast/5 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUpIcon className="h-4 w-4 text-warpcast mr-2" />
            <span className="font-serif text-ink-dark">Total Votes</span>
          </div>
          <span className="font-serif font-medium text-ink-dark">
            {formatEther(votes)}
          </span>
        </div>
      </div>
    </div>
  );
};