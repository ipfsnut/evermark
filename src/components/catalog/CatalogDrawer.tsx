import React, { useState } from 'react';
import { CatalogCard } from './CatalogCard';
import { Evermark } from '../../types/evermark.types';
import { ChevronDownIcon, ChevronUpIcon, BookOpenIcon, FilterIcon } from 'lucide-react';

interface CatalogDrawerProps {
  title: string;
  evermarks: Evermark[];
  collapsible?: boolean;
  className?: string;
}

export const CatalogDrawer: React.FC<CatalogDrawerProps> = ({ 
  title, 
  evermarks, 
  collapsible = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  // Sort evermarks based on selected option
  const sortedEvermarks = [...evermarks].sort((a, b) => {
    return sortBy === 'newest'
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
  
  return (
    <div className={`mb-8 transition-all duration-300 ${className}`}>
      {/* Drawer header - modernized with warpcast accent */}
      <div 
        className={`bg-wood-texture p-4 rounded-t-lg flex justify-between items-center shadow-lg relative ${
          collapsible ? 'cursor-pointer' : ''
        }`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        {/* Accent gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-wood-dark/80 to-wood-dark/50 rounded-t-lg"></div>
        
        {/* Purple accent line */}
        <div className="absolute top-0 left-0 h-1 w-1/3 bg-gradient-to-r from-warpcast to-warpcast/0 rounded-tl-lg"></div>
        
        {/* Title with icon */}
        <h2 className="font-serif text-xl tracking-wide text-parchment-light relative z-10 flex items-center">
          <BookOpenIcon className="w-5 h-5 mr-2 text-warpcast-light" />
          {title}
        </h2>
        
        <div className="flex items-center space-x-4 relative z-10">
          {/* Sort dropdown */}
          {isOpen && (
            <div className="hidden md:flex items-center text-parchment-light/80 text-sm">
              <FilterIcon className="w-3.5 h-3.5 mr-1.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                className="bg-transparent text-parchment-light border-none focus:ring-0 text-sm py-0.5 cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <option value="newest" className="text-ink-dark">Newest First</option>
                <option value="oldest" className="text-ink-dark">Oldest First</option>
              </select>
            </div>
          )}
          
          {/* Modernized drawer pulls */}
          <div className="flex space-x-1 items-center">
            <div className="w-2 h-2 rounded-full bg-warpcast/70 shadow-sm"></div>
            <div className="w-2 h-2 rounded-full bg-warpcast/70 shadow-sm"></div>
          </div>
          
          {collapsible && (
            <button 
              className="p-1 hover:bg-warpcast/20 rounded transition-colors"
              aria-label={isOpen ? "Collapse drawer" : "Expand drawer"}
            >
              {isOpen ? (
                <ChevronUpIcon className="h-4 w-4 text-parchment-light" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-parchment-light" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Drawer content - parchment texture with tech accents */}
      {isOpen && (
        <div className="bg-parchment-texture p-5 rounded-b-lg transition-all duration-300 border-x border-b border-wood-light/30">
          {sortedEvermarks.length === 0 ? (
            <div className="text-center py-10 italic text-ink-light border border-dashed border-wood-light bg-parchment-light bg-opacity-70 rounded">
              <p className="font-serif">This drawer is empty.</p>
              <p className="text-sm mt-1 font-serif">No cards have been catalogued yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEvermarks.map((evermark, index) => (
                <div key={evermark.id} className="animate-text-in" style={{animationDelay: `${index * 0.05}s`}}>
                  <CatalogCard evermark={evermark} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};