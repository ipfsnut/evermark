// src/pages/HomePage.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEvermarks } from '../hooks/useEvermarks';
import { Link } from 'react-router-dom';
import { PlusIcon, BookmarkIcon, BookOpenIcon, SearchIcon } from 'lucide-react';
import { Evermark } from '../types/evermark.types';
import { CatalogDrawer } from '../components/catalog/CatalogDrawer';
import { WeeklyIndexBrowser } from '../components/ipfs/WeeklyIndexBrowser';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { list, loading } = useEvermarks();
  const [recentEvermarks, setRecentEvermarks] = useState<Evermark[]>([]);
  const [popularEvermarks, setPopularEvermarks] = useState<Evermark[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEvermarks = async () => {
      try {
        // Show loading indicator while fetching
        if (loading) return;
        
        const evermarks = await list();
        
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
  }, [list, loading]);

  return (
    <div className="space-y-8 transition-all duration-300">
      {/* Enhanced Hero Section with search */}
      <div className="relative overflow-hidden rounded-xl shadow-xl">
        {/* Background with texture and overlay */}
        <div className="bg-parchment-texture absolute inset-0"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-warpcast/5 via-transparent to-warpcast/10"></div>
        
        {/* Purple light beam effect */}
        <div className="absolute -top-20 -right-20 w-40 h-80 bg-warpcast/20 blur-3xl rotate-15 opacity-70"></div>
        
        {/* New decorative bookshelf texture */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-wood-dark opacity-10"></div>
        
        {/* Content */}
        <div className="relative py-12 px-8 text-center">
          <div className="relative inline-block mb-6">
            <BookOpenIcon className="mx-auto h-16 w-16 text-warpcast mb-4" />
            <div className="absolute -inset-1 rounded-full bg-warpcast/5 blur-md -z-10"></div>
          </div>
          
          <h1 className="text-responsive-title mb-3 animate-text-in">
            Welcome to <span className="text-warpcast relative">
              Evermark
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-warpcast/30"></span>
            </span> Library
          </h1>
          
          <p className="text-responsive-body mb-6 max-w-2xl mx-auto animate-text-in">
            Preserve and catalogue your favorite content from across the internet.
          </p>
          
          {/* Search bar */}
          <div className="max-w-md mx-auto mb-8 relative animate-text-in">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the library..."
                className="w-full px-4 py-3 pl-10 bg-parchment-light/80 border border-brass/30 rounded-md focus:outline-none focus:ring-2 focus:ring-warpcast/30 font-serif text-ink-dark shadow-inner"
                aria-label="Search the library"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brass-dark" />
            </div>
          </div>
          
          {isAuthenticated ? (
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/create"
                className="btn-primary px-6 py-3 rounded-md"
              >
                <PlusIcon className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Create Evermark</span>
              </Link>
              <Link
                to="/my-evermarks"
                className="btn-secondary px-6 py-3 rounded-md"
              >
                <BookmarkIcon className="w-5 h-5 mr-2" />
                <span>My Collection</span>
              </Link>
            </div>
          ) : (
            <div className="text-ink-light font-serif p-6 inline-block rounded-md bg-parchment border border-warpcast/20 shadow-md relative backdrop-blur-sm">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-warpcast/30 to-warpcast/5 rounded-md blur-sm -z-10"></div>
              Connect your wallet to get started
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview - only show if there are evermarks */}
      {(recentEvermarks.length > 0 || popularEvermarks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-parchment-texture rounded-lg overflow-hidden shadow-md border border-wood-light/50 relative group hover:border-warpcast/30 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute top-0 left-0 w-full h-1 bg-warpcast/50"></div>
            <div className="p-4 flex items-center">
              <div className="p-3 rounded-full bg-warpcast/10 mr-4 group-hover:bg-warpcast/20 transition-colors">
                <BookOpenIcon className="w-6 h-6 text-warpcast" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-medium text-ink-dark dark:text-parchment-light">Library Entries</h3>
                <p className="text-2xl font-mono text-warpcast font-bold">
                  {recentEvermarks.length + popularEvermarks.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Index from IPFS */}
      <WeeklyIndexBrowser className="mb-8" />

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
      {recentEvermarks.length === 0 && popularEvermarks.length === 0 && (
        <div className="relative text-center py-16 bg-parchment-texture border border-wood-light rounded-lg overflow-hidden">
          {/* Add decorative elements */}
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-warpcast/30 via-warpcast/10 to-warpcast/30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-warpcast/5 to-transparent pointer-events-none"></div>
          
          <BookOpenIcon className="mx-auto h-16 w-16 text-wood opacity-60 mb-6" />
          <div className="relative">
            <h3 className="text-responsive-card-title mb-4">The Library Awaits Its First Entry</h3>
            <p className="mt-2 text-ink-light max-w-lg mx-auto leading-relaxed px-4">
              Your digital library is empty and ready for your first contribution. Preserve valuable content for posterity.
            </p>
            {isAuthenticated && (
              <Link
                to="/create"
                className="mt-8 btn-primary px-6 py-3 rounded-md inline-flex items-center"
              >
                <PlusIcon className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Create Your First Evermark</span>
              </Link>
            )}
          </div>
          
          {/* Decorative book-related elements */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brass/20 to-transparent"></div>
        </div>
      )}
    </div>
  );
};

export default HomePage;