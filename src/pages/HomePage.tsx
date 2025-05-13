// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEvermarks } from '../hooks/useEvermarks';
import { Link } from 'react-router-dom';
import { PlusIcon, BookmarkIcon, BookOpenIcon } from 'lucide-react';
import { Evermark } from '../types/evermark.types';
import { CatalogCard } from '../components/catalog/CatalogCard';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { list: listEvermarks, loading, error } = useEvermarks();
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-parchment border border-wood-light rounded-lg shadow-md">
        <BookOpenIcon className="mx-auto h-16 w-16 text-brass mb-4" />
        <h1 className="text-4xl font-serif font-bold text-ink-dark mb-4">
          Welcome to Evermark
        </h1>
        <p className="text-xl text-ink-light mb-8 max-w-2xl mx-auto font-serif">
          Preserve and catalogue your favorite content from across the internet.
        </p>
        
        {isAuthenticated ? (
          <div className="flex gap-4 justify-center">
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-wood text-parchment-light rounded-md hover:bg-wood-dark transition-colors shadow-md"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Evermark
            </Link>
            <Link
              to="/my-evermarks"
              className="inline-flex items-center px-6 py-3 bg-parchment-light text-ink border border-wood-light rounded-md hover:bg-parchment-dark transition-colors shadow"
            >
              <BookmarkIcon className="w-5 h-5 mr-2" />
              My Evermarks
            </Link>
          </div>
        ) : (
          <div className="text-ink-light font-serif">
            Connect your wallet to get started
          </div>
        )}
      </div>

      {/* Recent Evermarks */}
      <div>
        <div className="flex items-center mb-6">
          <div className="h-0.5 flex-grow bg-wood-light"></div>
          <h2 className="text-2xl font-serif font-bold text-ink-dark px-4">Recent Acquisitions</h2>
          <div className="h-0.5 flex-grow bg-wood-light"></div>
        </div>
        
        {error ? (
          <div className="text-center py-8 text-red-600 font-serif">
            Failed to load evermarks. Please try again.
          </div>
        ) : recentEvermarks.length === 0 ? (
          <div className="text-center py-8 text-ink-light font-serif bg-parchment-light border border-dashed border-wood-light rounded-lg">
            No evermarks yet. Be the first to create one!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentEvermarks.map((evermark: Evermark) => (
              <CatalogCard key={evermark.id} evermark={evermark} />
            ))}
          </div>
        )}
      </div>

      {/* Stats Section */}
      {isAuthenticated && user && (
        <div className="bg-parchment border border-wood-light rounded-lg shadow p-6">
          <h2 className="text-xl font-serif font-bold text-ink-dark mb-4">Your Library Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center bg-parchment-light p-4 rounded border border-wood-light">
              <div className="text-3xl font-bold text-brass-dark font-mono">
                {user.evermarksCount || 0}
              </div>
              <div className="text-sm text-ink-light font-serif">Evermarks Created</div>
            </div>
            <div className="text-center bg-parchment-light p-4 rounded border border-wood-light">
              <div className="text-3xl font-bold text-brass-dark font-mono">
                {user.votingPower || 0}
              </div>
              <div className="text-sm text-ink-light font-serif">Voting Power</div>
            </div>
            <div className="text-center bg-parchment-light p-4 rounded border border-wood-light">
              <div className="text-3xl font-bold text-brass-dark font-mono">
                {user.totalVotes || 0}
              </div>
              <div className="text-sm text-ink-light font-serif">Votes Cast</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;