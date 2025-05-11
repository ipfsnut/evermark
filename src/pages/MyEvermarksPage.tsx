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
  EmptyCircleIcon 
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
      <div className="text-center py-12">
        <EmptyCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Not authenticated</h3>
        <p className="mt-1 text-sm text-gray-500">
          Please connect your wallet to view your evermarks.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Evermarks</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage and track your created evermarks
          </p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <BookmarkIcon className="w-4 h-4 mr-2" />
          Create New
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <BookmarkIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Evermarks</p>
              <p className="text-2xl font-bold text-gray-900">{userEvermarks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <VoteIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Voting Power</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatEther(balances.votingPower)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUpIcon className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Votes Received</p>
              <p className="text-2xl font-bold text-gray-900">
                {/* You'd need to calculate this from your evermarks */}
                {userEvermarks.reduce((sum, e) => sum + (e.metadata?.totalVotes || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sorting Options */}
      <div className="flex justify-between items-center">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="mostVoted">Most Voted</option>
        </select>
      </div>

      {/* Evermarks List */}
      {error ? (
        <div className="text-center py-8 text-red-600">
          Failed to load your evermarks. Please try again.
        </div>
      ) : sortedEvermarks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <EmptyCircleIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No evermarks yet</h3>
          <p className="mt-2 text-sm text-gray-600">
            Start preserving your favorite content by creating your first evermark.
          </p>
          <Link
            to="/create"
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <BookmarkIcon className="w-4 h-4 mr-2" />
            Create Your First Evermark
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedEvermarks.map((evermark) => (
            <div key={evermark.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <Link 
                      to={`/evermark/${evermark.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {evermark.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      Created on {new Date(evermark.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 mt-2 line-clamp-2">
                      {evermark.description}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {evermark.metadata?.type || 'website'}
                      </span>
                      <span className="text-sm text-gray-500">
                        by {evermark.author}
                      </span>
                      {evermark.verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      {evermark.metadata?.totalVotes || 0} votes
                    </span>
                    {evermark.metadata?.external_url && (
                      <a
                        href={evermark.metadata.external_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
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