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
      <div className="text-center py-12 bg-parchment-texture rounded-lg border border-wood-light">
        <BookOpenIcon className="mx-auto h-12 w-12 text-wood opacity-60 mb-3" />
        <h3 className="mt-2 text-responsive-card-title text-ink-dark">Not authenticated</h3>
        <p className="mt-2 text-sm font-serif text-ink-light leading-relaxed tracking-wide">
          Please connect your wallet to view your evermarks.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center animate-text-in">
        <div>
          <h1 className="text-responsive-title text-ink-dark">My Collection</h1>
          <p className="mt-2 text-sm font-serif text-ink-light leading-relaxed tracking-wide">
            Manage your personal library of preserved content
          </p>
        </div>
        <Link
          to="/create"
          className="flex items-center px-4 py-2 bg-wood text-parchment-light rounded-md hover:bg-wood-dark transition-colors shadow-md font-serif"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add New Item
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-parchment-texture rounded-lg shadow p-6 border border-wood-light animate-text-in" style={{animationDelay: "0.1s"}}>
          <div className="flex items-center">
            <BookmarkIcon className="h-8 w-8 text-brass" />
            <div className="ml-3">
              <p className="text-sm font-serif font-medium text-ink-light tracking-tight">Total Evermarks</p>
              <p className="text-2xl font-serif font-bold text-ink-dark tracking-tight">
                {userEvermarks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-parchment-texture rounded-lg shadow p-6 border border-wood-light animate-text-in" style={{animationDelay: "0.2s"}}>
          <div className="flex items-center">
            <VoteIcon className="h-8 w-8 text-brass" />
            <div className="ml-3">
              <p className="text-sm font-serif font-medium text-ink-light tracking-tight">Voting Power</p>
              <p className="text-2xl font-serif font-bold text-ink-dark tracking-tight">
                {formatEther(balances.votingPower)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-parchment-texture rounded-lg shadow p-6 border border-wood-light animate-text-in" style={{animationDelay: "0.3s"}}>
          <div className="flex items-center">
            <TrendingUpIcon className="h-8 w-8 text-brass" />
            <div className="ml-3">
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
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-md border-wood-light shadow-sm focus:border-brass focus:ring-brass bg-parchment font-serif text-sm p-2 transition-colors duration-200"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="mostVoted">Most Voted</option>
        </select>
      </div>

      {/* Evermarks List */}
      {error ? (
        <div className="text-center py-8 text-red-600 font-serif leading-relaxed animate-text-in">
          Failed to load your evermarks. Please try again.
        </div>
      ) : sortedEvermarks.length === 0 ? (
        <div className="text-center py-12 bg-parchment-texture rounded-lg border border-wood-light animate-text-in" style={{animationDelay: "0.5s"}}>
          <BookOpenIcon className="mx-auto h-12 w-12 text-wood opacity-60 mb-4" />
          <h3 className="text-responsive-card-title text-ink-dark">Your Collection is Empty</h3>
          <p className="mt-2 text-sm font-serif text-ink-light leading-relaxed tracking-wide">
            Start preserving your favorite content by creating your first evermark.
          </p>
          <Link
            to="/create"
            className="mt-4 inline-flex items-center px-4 py-2 bg-wood text-parchment-light rounded-md hover:bg-wood-dark transition-colors shadow-md font-serif"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create Your First Evermark
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvermarks.map((evermark, index) => (
            <div 
              key={evermark.id} 
              className="bg-index-card rounded-lg shadow overflow-hidden border border-wood-light animate-text-in" 
              style={{animationDelay: `${0.1 * (index % 4) + 0.5}s`}}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link 
                      to={`/evermark/${evermark.id}`}
                      className="text-responsive-card-title text-ink-dark hover:text-brass transition-colors duration-200"
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
                        className="p-2 text-brass hover:text-brass-dark transition-colors duration-200"
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
