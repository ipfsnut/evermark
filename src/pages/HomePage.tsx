// src/pages/HomePage.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEvermarks } from '../hooks/useEvermarks';
import { Link } from 'react-router-dom';
import { PlusIcon, BookmarkIcon, BookOpenIcon, SparklesIcon, TrendingUpIcon } from 'lucide-react';
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
        <div className="w-16 h-16 relative">
          <div className="absolute inset-0 rounded-full border-4 border-t-warpcast border-r-warpcast/30 border-b-warpcast/10 border-l-warpcast/70 animate-spin"></div>
          <BookOpenIcon className="absolute inset-0 m-auto w-6 h-6 text-warpcast-light" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 transition-all duration-300">
      {/* Hero Section with Warpcast accents */}
      <div className="relative overflow-hidden rounded-xl shadow-2xl">
        {/* Background with texture and overlay */}
        <div className="absolute inset-0 bg-parchment-texture opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-warpcast/5 via-transparent to-warpcast/10"></div>
        
        {/* Purple light beam effect */}
        <div className="absolute -top-20 -right-20 w-40 h-80 bg-warpcast/20 blur-3xl rotate-15 opacity-70"></div>
        
        {/* Content */}
        <div className="relative py-12 px-8 text-center">
          <div className="relative inline-block mb-6">
            <BookOpenIcon className="mx-auto h-16 w-16 text-warpcast mb-4" />
            <div className="absolute -inset-1 rounded-full bg-warpcast/5 blur-md -z-10"></div>
          </div>
          
          <h1 className="text-responsive-title text-ink-dark mb-2 animate-text-in">
            Welcome to <span className="text-warpcast">Evermark</span> Library
          </h1>
          
          <p className="text-responsive-body text-ink-light mb-8 max-w-2xl mx-auto animate-text-in">
            Preserve and catalogue your favorite content from across the internet.
          </p>
          
          {isAuthenticated ? (
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/create"
                className="inline-flex items-center px-6 py-3 bg-warpcast text-white rounded-md hover:bg-warpcast-dark transition-all duration-300 shadow-lg hover:shadow-warpcast/20 hover:shadow-xl"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Evermark
              </Link>
              <Link
                to="/my-evermarks"
                className="inline-flex items-center px-6 py-3 bg-parchment border border-warpcast/30 rounded-md hover:border-warpcast hover:bg-parchment-dark transition-all duration-300 shadow-md text-ink-dark hover:text-warpcast-dark"
              >
                <BookmarkIcon className="w-5 h-5 mr-2" />
                My Collection
              </Link>
            </div>
          ) : (
            <div className="text-ink-light font-serif p-6 inline-block rounded-md bg-parchment border border-warpcast/20 shadow-md relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-warpcast/30 to-warpcast/5 rounded-md blur-sm -z-10"></div>
              Connect your wallet to get started
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview - only show if there are evermarks */}
      {(recentEvermarks.length > 0 || popularEvermarks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-parchment-texture rounded-lg overflow-hidden shadow-md border border-wood-light/50 relative group hover:border-warpcast/30 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-warpcast/50"></div>
            <div className="p-4 flex items-center">
              <div className="p-3 rounded-full bg-warpcast/10 mr-4">
                <BookOpenIcon className="w-6 h-6 text-warpcast" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-medium text-ink-dark">Library Entries</h3>
                <p className="text-2xl font-mono text-warpcast font-bold">
                  {recentEvermarks.length + popularEvermarks.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-parchment-texture rounded-lg overflow-hidden shadow-md border border-wood-light/50 relative group hover:border-warpcast/30 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-warpcast/50"></div>
            <div className="p-4 flex items-center">
              <div className="p-3 rounded-full bg-warpcast/10 mr-4">
                <SparklesIcon className="w-6 h-6 text-warpcast" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-medium text-ink-dark">Content Types</h3>
                <p className="text-2xl font-mono text-warpcast font-bold">
                  {Array.from(new Set(recentEvermarks.map(e => e.metadata?.type))).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-parchment-texture rounded-lg overflow-hidden shadow-md border border-wood-light/50 relative group hover:border-warpcast/30 transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-warpcast/50"></div>
            <div className="p-4 flex items-center">
              <div className="p-3 rounded-full bg-warpcast/10 mr-4">
                <TrendingUpIcon className="w-6 h-6 text-warpcast" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-medium text-ink-dark">Top Votes</h3>
                <p className="text-2xl font-mono text-warpcast font-bold">
                  {popularEvermarks[0]?.metadata?.totalVotes || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Empty state with upgraded styling */}
      {recentEvermarks.length === 0 && (
        <div className="relative text-center py-16 bg-parchment-texture border border-wood-light rounded-lg overflow-hidden">
          {/* Add warpcast glow effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-warpcast/5 to-transparent pointer-events-none"></div>
          
          <BookOpenIcon className="mx-auto h-16 w-16 text-wood opacity-60 mb-6" />
          <div className="relative">
            <h3 className="text-responsive-card-title text-ink-dark mb-4">The Library is Empty</h3>
            <p className="mt-2 font-serif text-ink-light max-w-lg mx-auto leading-relaxed px-4">
              No evermarks have been catalogued yet. Be the first to preserve valuable content for the library.
            </p>
            {isAuthenticated && (
              <Link
                to="/create"
                className="mt-8 inline-flex items-center px-6 py-3 bg-warpcast text-white rounded-md hover:bg-warpcast-dark transition-all duration-300 shadow-lg hover:shadow-warpcast/30"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Your First Evermark
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;