// src/pages/VotingHistoryPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useVoting } from '../hooks/useVoting';
import { useEvermarks } from '../hooks/useEvermarks';
import { PageContainer } from '../components/layout/PageContainer';
import { HistoryIcon, CalendarIcon, BookOpenIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const VotingHistoryPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { getUserVotesForEvermark, getEvermarksInCycle, getCurrentCycle } = useVoting();
  const { fetchEvermark } = useEvermarks();
  const [votedEvermarks, setVotedEvermarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadVotingHistory = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Get current cycle
        const cycle = await getCurrentCycle();
        
        // Get all evermarks with votes in the current cycle
        const evermarksWithVotes = await getEvermarksInCycle(cycle);
        
        // For each evermark, check if the user has voted for it
        const userVotes = await Promise.all(
          evermarksWithVotes.map(async (id) => {
            // Get user's votes for this evermark
            const votes = await getUserVotesForEvermark(id, user?.walletAddress);
            
            // If user has votes, fetch evermark details
            if (votes > BigInt(0)) {
              const evermark = await fetchEvermark(id);
              return {
                ...evermark,
                votes
              };
            }
            return null;
          })
        );
        
        // Filter out null values and sort by vote amount (descending)
        const filteredVotes = userVotes
          .filter(v => v !== null)
          .sort((a, b) => (b?.votes > a?.votes ? 1 : -1));
        
        setVotedEvermarks(filteredVotes);
      } catch (error) {
        console.error("Failed to load voting history:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVotingHistory();
  }, [user, isAuthenticated, getUserVotesForEvermark, getEvermarksInCycle, getCurrentCycle, fetchEvermark]);
  
  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <PageContainer
        title="Your Voting History"
        description="View all the Evermarks you've supported"
        icon={<HistoryIcon className="h-7 w-7 text-warpcast" />}
      >
        <div className="text-center py-12 bg-parchment-texture rounded-lg">
          <BookOpenIcon className="mx-auto h-12 w-12 text-wood opacity-60 mb-4" />
          <h3 className="text-responsive-card-title text-ink-dark font-serif">Not Authenticated</h3>
          <p className="mt-2 text-sm font-serif text-ink-light leading-relaxed tracking-wide">
            Please connect your wallet to view your voting history.
          </p>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer
      title="Your Voting History"
      description="View all the Evermarks you've supported"
      icon={<HistoryIcon className="h-7 w-7 text-warpcast" />}
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warpcast"></div>
        </div>
      ) : votedEvermarks.length > 0 ? (
        <div className="space-y-4">
          {votedEvermarks.map((item, index) => (
            <div key={item.id} className="bg-parchment-texture p-4 rounded-lg border border-wood-light/30 animate-text-in" style={{animationDelay: `${index * 0.1}s`}}>
              <Link to={`/evermark/${item.id}`} className="flex justify-between items-center">
                <div>
                  <h3 className="text-responsive-card-title text-ink-dark hover:text-warpcast transition-colors">{item.title}</h3>
                  <p className="text-sm font-serif text-ink-light">by {item.author}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-serif text-ink-dark font-medium">{Number(item.votes) / 10**18} votes</div>
                  <div className="text-xs font-serif text-ink-light flex items-center justify-end mt-1">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-parchment-texture rounded-lg">
          <BookOpenIcon className="mx-auto h-12 w-12 text-wood opacity-60 mb-4" />
          <h3 className="text-responsive-card-title text-ink-dark font-serif">No Voting History</h3>
          <p className="mt-2 text-sm font-serif text-ink-light leading-relaxed tracking-wide">
            You haven't voted on any Evermarks yet. Explore the library and support content you value.
          </p>
          <Link to="/" className="mt-6 inline-block px-6 py-2 bg-warpcast text-white rounded-md font-serif">
            Explore Library
          </Link>
        </div>
      )}
    </PageContainer>
  );
};

export default VotingHistoryPage;