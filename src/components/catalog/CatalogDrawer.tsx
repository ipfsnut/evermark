// src/components/catalog/CatalogDrawer.tsx
import React from 'react';
import { CatalogCard } from './CatalogCard';
import { Evermark } from '../../types/evermark.types';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

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
  const [isOpen, setIsOpen] = React.useState(true);
  
  return (
    <div className="mb-8">
      {/* Drawer header */}
      <div 
        className={`bg-wood text-parchment-light p-3 rounded-t-lg flex justify-between items-center shadow-drawer ${
          collapsible ? 'cursor-pointer' : ''
        }`}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        <h2 className="font-serif text-xl tracking-wide">{title}</h2>
        <div className="flex items-center space-x-2">
          {/* Brass drawer pulls */}
          <div className="w-3 h-3 rounded-full bg-brass shadow-sm"></div>
          <div className="w-3 h-3 rounded-full bg-brass shadow-sm"></div>
          
          {collapsible && (
            <button className="ml-2 p-1 hover:bg-wood-light rounded">
              {isOpen ? (
                <ChevronUpIcon className="h-4 w-4 text-parchment-light" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-parchment-light" />
              )}
            </button>
          )}
        </div>
      </div>
      
      {/* Drawer content */}
      {isOpen && (
        <div className="bg-parchment-light p-5 rounded-b-lg shadow-drawer border-x border-b border-wood-light">
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