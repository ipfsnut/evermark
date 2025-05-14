// src/components/catalog/CatalogDrawer.tsx
import React, { useState } from 'react';
import { CatalogCard } from './CatalogCard';
import { Evermark } from '../../types/evermark.types';
import { ChevronDownIcon, ChevronUpIcon, BookOpenIcon } from 'lucide-react';

interface CatalogDrawerProps {
  title: string;
  evermarks: Evermark[];
  collapsible?: boolean;
}

export const CatalogDrawer: React.FC<CatalogDrawerProps> = ({ 
  title, 
  evermarks, 
  collapsible = true 
}) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="mb-8 transition-all duration-300">
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
        
        <div className="flex items-center space-x-2 relative z-10">
          {/* Modernized drawer pulls */}
          <div className="flex space-x-1">
            <div className="w-2 h-2 rounded-full bg-warpcast/70 shadow-sm"></div>
            <div className="w-2 h-2 rounded-full bg-warpcast/70 shadow-sm"></div>
          </div>
          
          {collapsible && (
            <button className="ml-2 p-1 hover:bg-warpcast/20 rounded transition-colors">
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
        <div className="techno-parchment p-5 rounded-b-lg transition-all duration-300">
          {evermarks.length === 0 ? (
            <div className="text-center py-10 italic text-ink-light border border-dashed border-wood-light bg-parchment bg-opacity-70 rounded">
              <p>This drawer is empty.</p>
              <p className="text-sm mt-1">No cards have been catalogued yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {evermarks.map(evermark => (
                <CatalogCard key={evermark.id} evermark={evermark} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};