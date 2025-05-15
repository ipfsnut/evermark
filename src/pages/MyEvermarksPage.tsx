import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useEvermarks } from '../hooks/useEvermarks';
import { useBlockchain } from '../hooks/useBlockchain';
import { formatEther } from '../services/blockchain';
import { 
  BookmarkIcon, 
  VoteIcon, 
  TrendingUpIcon, 
  ExternalLinkIcon,
  BookOpenIcon,
  PlusIcon
} from 'lucide-react';
import { StatusMessage } from '../components/forms/StatusMessage';
import { StyledButton } from '../components/forms/StyledButton';
import { StyledSelect } from '../components/forms/StyledSelect';

const MyEvermarksPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { fetchUserEvermarks, userEvermarks, loading, error } = useEvermarks();
  const { balances, stakeInfo } = useBlockchain();
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'mostVoted'>('newest');

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserEvermarks();
    }
  }, [isAuthenticated, user]);

  const sortedEvermarks = [...userEvermarks].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'mostVoted':
        // Note: You'd need to implement vote counting in your system
        return (b.metadata?.totalVotes || 0) - (a.metadata?.totalVotes || 0);
      default:
        return 0;
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12 bg-parchment-texture rounded-lg border border-wood-light shadow-md">
        <BookOpenIcon className="mx-auto h-12 w-12 text-wood opacity-60 mb-3" />
        <h3 className="mt-2 text-responsive-card-title text-ink-dark font-serif">Not Authenticated</h3>
        <p className="mt-2 text-sm font-serif text-ink-light leading-relaxed tracking-wide">
          Please connect your wallet to view your evermarks.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-t-warpcast border-r-warpcast/30 border-b-warpcast/10 border-l-warpcast/70 animate-spin"></div>
          <BookOpenIcon className="absolute inset-0 m-auto w-6 h-6 text-warpcast-light" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center animate-text-in">
        <div>
          <div className="flex items-center mb-2">
            <BookmarkIcon className="h-7 w-7 text-warpcast mr-2" />
            <h1 className="text-responsive-title text-ink-dark font-serif">My Collection</h1>
          </div>
          <p className="mt-1 text-sm font-serif text-ink-light leading-relaxed tracking-wide ml-9">
            Manage your personal library of preserved content
          </p>
        </div>
        
        <StyledButton
          as={Link}
          to="/create"
          variant="primary"
          size="md"
          icon={<PlusIcon className="w-4 h-4" />}
        >
          Add New Item
        </StyledButton>
      </div>

      {/* Error Message */}
      {error && (
        <StatusMessage
          type="error"
          message="Failed to load your evermarks. Please try again."
        />
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-parchment-texture rounded-lg shadow-md p-6 border border-wood-light animate-text-in" style={{animationDelay: "0.1s"}}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warpcast/10 mr-4">
              <BookmarkIcon className="h-6 w-6 text-warpcast" />
            </div>
            <div>
              <p className="text-sm font-serif font-medium text-ink-light tracking-tight">Total Evermarks</p>
              <p className="text-2xl font-serif font-bold text-ink-dark tracking-tight">
                {userEvermarks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-parchment-texture rounded-lg shadow-md p-6 border border-wood-light animate-text-in" style={{animationDelay: "0.2s"}}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warpcast/10 mr-4">
              <VoteIcon className="h-6 w-6 text-warpcast" />
            </div>
            <div>
              <p className="text-sm font-serif font-medium text-ink-light tracking-tight">Voting Power</p>
              <p className="text-2xl font-serif font-bold text-ink-dark tracking-tight">
                {formatEther(balances.votingPower)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-parchment-texture rounded-lg shadow-md p-6 border border-wood-light animate-text-in" style={{animationDelay: "0.3s"}}>
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-warpcast/10 mr-4">
              <TrendingUpIcon className="h-6 w-6 text-warpcast" />
            </div>
            <div>
              <p className="text-sm font-serif font-medium text-ink-light tracking-tight">Total Votes Received</p>
              <p className="text-2xl font-serif font-bold text-ink-dark tracking-tight">
                {userEvermarks.reduce((sum, e) => sum + (e.metadata?.totalVotes || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sorting Options */}
      <div className="flex justify-between items-center animate-text-in" style={{animationDelay: "0.4s"}}>
        <StyledSelect
          id="sort-by"
          label="Sort By"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          options={[
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'mostVoted', label: 'Most Voted' }
          ]}
          containerClassName="w-48"
          labelClassName="sr-only" // Hide label visually but keep for screen readers
        />
      </div>

      {/* Evermarks List */}
      {sortedEvermarks.length === 0 ? (
        <div className="text-center py-12 bg-parchment-texture rounded-lg border border-wood-light animate-text-in shadow-md" style={{animationDelay: "0.5s"}}>
          <BookOpenIcon className="mx-auto h-12 w-12 text-wood opacity-60 mb-4" />
          <h3 className="text-responsive-card-title text-ink-dark font-serif">Your Collection is Empty</h3>
          <p className="mt-2 text-sm font-serif text-ink-light leading-relaxed tracking-wide max-w-md mx-auto">
            Start preserving your favorite content by creating your first evermark.
          </p>
          <div className="mt-6">
            <StyledButton
              as={Link}
              to="/create"
              variant="primary"
              size="md"
              icon={<PlusIcon className="w-4 h-4" />}
            >
              Create Your First Evermark
            </StyledButton>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvermarks.map((evermark, index) => (
            <div 
              key={evermark.id} 
              className="bg-index-card rounded-lg shadow-md overflow-hidden border border-wood-light animate-text-in hover:shadow-lg transition-shadow duration-300" 
              style={{animationDelay: `${0.1 * (index % 4) + 0.5}s`}}
            >
              <div className="p-6 relative overflow-hidden">
                {/* Accent corner with warpcast gradient */}
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-warpcast/10 to-transparent pointer-events-none" />
                
                <div className="flex justify-between items-start relative">
                  <div className="flex-1">
                    <Link 
                      to={`/evermark/${evermark.id}`}
                      className="text-responsive-card-title font-serif text-ink-dark hover:text-warpcast transition-colors duration-200"
                    >
                      {evermark.title}
                    </Link>
                    <p className="text-sm font-serif text-ink-light mt-1 tracking-wide">
                      Created on {new Date(evermark.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-ink-dark font-serif mt-2 line-clamp-2 leading-relaxed">
                      {evermark.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-serif bg-parchment text-ink-dark border border-wood-light tracking-wide">
                        {evermark.metadata?.type || 'website'}
                      </span>
                      <span className="text-sm font-serif text-ink-light tracking-wide">
                        by {evermark.author}
                      </span>
                      {evermark.verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-serif bg-green-100 text-green-800 tracking-wide">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-serif text-ink-light tracking-wide">
                      {evermark.metadata?.totalVotes || 0} votes
                    </span>
                    {evermark.metadata?.external_url && (
                      <a
                        href={evermark.metadata.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-warpcast hover:text-warpcast-dark transition-colors duration-200"
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvermarksPage;
