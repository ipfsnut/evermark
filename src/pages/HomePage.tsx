// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEvermarks } from '../hooks/useEvermarks';
import { Link } from 'react-router-dom';
import { PlusIcon, BookmarkIcon, BookOpenIcon } from 'lucide-react';
import { Evermark } from '../types/evermark.types';
import { CatalogDrawer } from '../components/catalog/CatalogDrawer';

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { list: listEvermarks, loading, error } = useEvermarks();
  const [recentEvermarks, setRecentEvermarks] = useState<Evermark[]>([]);
  const [popularEvermarks, setPopularEvermarks] = useState<Evermark[]>([]);

  useEffect(() => {
    const fetchEvermarks = async () => {
      try {
        const evermarks = await listEvermarks();
        
        // Set recent evermarks
        setRecentEvermarks(evermarks.slice(0, 6));
        
        // Set popular evermarks (simulate by sorting by id for now)
        const sorted = [...evermarks].sort((a, b) => 
          Number(a.id) > Number(b.id) ? -1 : 1
        );
        setPopularEvermarks(sorted.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch evermarks:', err);
      }
    };

    fetchEvermarks();
  }, [listEvermarks]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wood"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 bg-parchment-texture border border-wood-light rounded-lg shadow-md">
        <BookOpenIcon className="mx-auto h-16 w-16 text-brass mb-4" />
        <h1 className="text-4xl font-serif font-bold text-ink-dark mb-4">
          Welcome to Evermark Library
        </h1>
        <p className="text-xl text-ink-light mb-8 max-w-2xl mx-auto font-serif">
          Preserve and catalogue your favorite content from across the internet.
        </p>
        
        {isAuthenticated ? (
          <div className="flex gap-4 justify-center">
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-wood text-parchment-light rounded-md hover:bg-wood-dark transition-colors shadow-md font-serif"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Evermark
            </Link>
            <Link
              to="/my-evermarks"
              className="inline-flex items-center px-6 py-3 bg-parchment border border-wood-light rounded-md hover:bg-parchment-dark transition-colors shadow-md font-serif text-ink-dark"
            >
              <BookmarkIcon className="w-5 h-5 mr-2" />
              My Collection
            </Link>
          </div>
        ) : (
          <div className="text-ink-light font-serif p-4 bg-parchment border border-wood-light inline-block rounded-md">
            Connect your wallet to get started
          </div>
        )}
      </div>

      {/* Recent Evermarks */}
      {recentEvermarks.length > 0 && (
        <CatalogDrawer 
          title="Recent Acquisitions" 
          evermarks={recentEvermarks} 
        />
      )}
      
      {/* Popular Evermarks */}
      {popularEvermarks.length > 0 && (
        <CatalogDrawer 
          title="Popular Bookmarks" 
          evermarks={popularEvermarks} 
          collapsible={true}
        />
      )}

      {/* Empty state if no evermarks */}
      {recentEvermarks.length === 0 && (
        <div className="text-center py-12 bg-parchment-texture border border-wood-light rounded-lg">
          <BookOpenIcon className="mx-auto h-12 w-12 text-wood opacity-60 mb-4" />
          <h3 className="text-lg font-serif font-medium text-ink-dark">The Library is Empty</h3>
          <p className="mt-2 font-serif text-ink-light max-w-md mx-auto">
            No evermarks have been catalogued yet. Be the first to preserve valuable content for the library.
          </p>
          {isAuthenticated && (
            <Link
              to="/create"
              className="mt-6 inline-flex items-center px-4 py-2 bg-wood text-parchment-light rounded-md hover:bg-wood-dark transition-colors shadow-md font-serif"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Create Your First Evermark
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;