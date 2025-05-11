import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEvermarks } from '../hooks/useEvermarks';
import { Link } from 'react-router-dom';
import { PlusIcon, BookmarkIcon, SparklesIcon } from 'lucide-react';
import { Evermark } from '../types/evermark.types';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { list: listEvermarks, loading, error } = useEvermarks();
  // Fix: Properly type the state as Evermark[] instead of letting TypeScript infer never[]
  const [recentEvermarks, setRecentEvermarks] = useState<Evermark[]>([]);

  useEffect(() => {
    const fetchRecentEvermarks = async () => {
      try {
        const evermarks = await listEvermarks();
        setRecentEvermarks(evermarks.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch recent evermarks:', err);
      }
    };

    fetchRecentEvermarks();
  }, [listEvermarks]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Evermark
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Preserve and share your favorite content forever on the blockchain. 
          Create, vote, and discover the best content on the internet.
        </p>
        
        {isAuthenticated ? (
          <div className="flex gap-4 justify-center">
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Evermark
            </Link>
            <Link
              to="/my-evermarks"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <BookmarkIcon className="w-5 h-5 mr-2" />
              My Evermarks
            </Link>
          </div>
        ) : (
          <div className="text-gray-600">
            Connect your wallet to get started
          </div>
        )}
      </div>

      {/* Recent Evermarks */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Evermarks</h2>
        
        {error ? (
          <div className="text-center py-8 text-red-600">
            Failed to load evermarks. Please try again.
          </div>
        ) : recentEvermarks.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No evermarks yet. Be the first to create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentEvermarks.map((evermark: Evermark) => (
              <Link 
                key={evermark.id} 
                to={`/evermark/${evermark.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{evermark.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">by {evermark.author}</p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                    {evermark.description || 'No description available'}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(evermark.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center text-xs text-purple-600">
                      <SparklesIcon className="w-3 h-3 mr-1" />
                      {evermark.metadata?.type || 'website'}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      {isAuthenticated && user && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {user.evermarksCount || 0}
              </div>
              <div className="text-sm text-gray-600">Evermarks Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {user.votingPower || 0}
              </div>
              <div className="text-sm text-gray-600">Voting Power</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {user.totalVotes || 0}
              </div>
              <div className="text-sm text-gray-600">Votes Cast</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;