// src/components/catalog/CatalogCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Evermark } from '../../types/evermark.types';
import { SparklesIcon } from 'lucide-react';

interface CatalogCardProps {
  evermark: Evermark;
}

export const CatalogCard: React.FC<CatalogCardProps> = ({ evermark }) => {
  return (
    <Link 
      to={`/evermark/${evermark.id}`}
      className="block transform transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    >
      <div 
        className="relative h-full rounded-lg shadow overflow-hidden bg-index-card"
      >
        {/* Content type tab */}
        <div 
          className="absolute -top-1 right-6 w-16 h-5 rounded-t-md flex items-center justify-center transform -rotate-1 shadow-sm"
          style={{ backgroundColor: '#c4a55f' }}
        >
          <span 
            className="text-xs font-mono"
            style={{ color: '#2a3544' }}
          >
            {evermark.metadata?.type || 'website'}
          </span>
        </div>
        
        <div className="p-4">
          <h3 
            className="font-serif font-semibold truncate"
            style={{ color: '#2a3544' }}
          >
            {evermark.title}
          </h3>
          <p 
            className="text-sm mt-1"
            style={{ color: '#394759' }}
          >
            by {evermark.author}
          </p>
          <p 
            className="text-sm mt-2 line-clamp-2"
            style={{ color: '#2a3544' }}
          >
            {evermark.description || 'No description available'}
          </p>
          
          <div className="mt-3 flex items-center justify-between">
            <span 
              className="text-xs font-mono"
              style={{ color: '#394759' }}
            >
              {new Date(evermark.createdAt).toLocaleDateString()}
            </span>
            <div 
              className="flex items-center text-xs"
              style={{ color: '#a58743' }}
            >
              <SparklesIcon className="w-3 h-3 mr-1" />
              <span className="font-mono">#{evermark.id.slice(0, 5)}</span>
            </div>
          </div>
        </div>
        
        {/* Verification stamp (if verified) */}
        {evermark.verified && (
          <div 
            className="absolute -rotate-12 top-4 right-5 border-2 rounded-md px-1 text-xs font-bold tracking-wider opacity-80"
            style={{ color: '#e53e3e', borderColor: '#e53e3e' }}
          >
            VERIFIED
          </div>
        )}
      </div>
    </Link>
  );
};