import React from 'react';
import { Link } from 'react-router-dom';
import { Evermark } from '../../types/evermark.types';
import { SparklesIcon, ExternalLinkIcon, UserIcon, CalendarIcon, TagIcon } from 'lucide-react';

interface CatalogCardProps {
  evermark: Evermark;
}

export const CatalogCard: React.FC<CatalogCardProps> = ({ evermark }) => {
  return (
    <Link 
      to={`/evermark/${evermark.id}`}
      className="block transform transition-all duration-300 hover:-translate-y-2 group"
    >
      <div className="card p-5 pb-4">
        {/* Decorative corner fold */}
        <div className="card-corner-fold"></div>
        
        {/* Content type tab */}
        <div 
          className="absolute -top-1 right-6 w-16 h-5 rounded-t-md flex items-center justify-center transform -rotate-1 shadow-sm bg-gradient-to-r from-brass to-brass-light group-hover:from-brass-light group-hover:to-brass transition-all duration-300"
        >
          <span 
            className="text-xs font-mono text-ink-dark font-medium tracking-tight"
          >
            {evermark.metadata?.type || 'website'}
          </span>
        </div>
        
        <h3 className="text-responsive-card-title truncate group-hover:text-warpcast-dark transition-colors duration-300">
          {evermark.title}
        </h3>
        
        <div className="flex items-center mt-1 text-ink-light">
          <UserIcon className="w-3.5 h-3.5 mr-1.5 text-brass-dark" />
          <p className="text-sm font-serif">
            {evermark.author}
          </p>
        </div>
        
        <p className="text-sm mt-3 line-clamp-2 min-h-[40px]">
          {evermark.description || 'No description available'}
        </p>
        
        <div className="mt-4 pt-3 border-t border-wood-light/20 flex items-center justify-between">
          <div className="flex items-center text-xs text-ink-light/80">
            <CalendarIcon className="w-3 h-3 mr-1" />
            <span className="font-mono">
              {new Date(evermark.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center text-xs text-brass-dark">
            <SparklesIcon className="w-3 h-3 mr-1" />
            <span className="font-mono">#{evermark.id.slice(0, 5)}</span>
          </div>
        </div>
        
        {/* Tags preview (if available) */}
        {evermark.metadata?.tags && evermark.metadata.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {evermark.metadata.tags.slice(0, 2).map(tag => (
              <span 
                key={tag}
                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-serif bg-amber-50 text-ink-light border border-amber-100"
              >
                <TagIcon className="w-2 h-2 mr-0.5" />
                {tag}
              </span>
            ))}
            {evermark.metadata.tags.length > 2 && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-serif bg-amber-50 text-ink-light border border-amber-100">
                +{evermark.metadata.tags.length - 2}
              </span>
            )}
          </div>
        )}
        
        {/* External link badge */}
        {evermark.metadata?.external_url && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-1 bg-parchment rounded-full shadow-sm text-warpcast hover:text-warpcast-dark transition-colors">
              <ExternalLinkIcon className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
        
        {/* Verification stamp (if verified) */}
        {evermark.verified && (
          <div 
            className="absolute -rotate-12 top-4 right-6 border-2 rounded-md px-1 text-xs font-bold tracking-wider opacity-80 text-red-700 border-red-700"
          >
            VERIFIED
          </div>
        )}
      </div>
    </Link>
  );
};
