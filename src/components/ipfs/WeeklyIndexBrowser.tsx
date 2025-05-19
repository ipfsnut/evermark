// src/components/ipfs/WeeklyIndexBrowser.tsx

import React, { useEffect, useState } from 'react';
import { CatalogCard } from '../catalog/CatalogCard';
import { BookOpenIcon } from 'lucide-react';
import { Evermark, ContentType } from '../../types/evermark.types';

// TypeScript interfaces for IPFS data
interface EvermarkIndexItem {
  id: string;
  title: string;
  author: string;
  description?: string;
  contentType: string;
  metadataURI: string;
  tags: string[];
  createdAt: number;
  votes: number;
  owner: string;
}

interface WeeklyIndexBrowserProps {
  className?: string;
}

export const WeeklyIndexBrowser: React.FC<WeeklyIndexBrowserProps> = ({ className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCycle, setCurrentCycle] = useState<string>('');
  const [indexItems, setIndexItems] = useState<EvermarkIndexItem[]>([]);
  
  // Helper function to convert string to ContentType enum
  const stringToContentType = (typeString: string): ContentType => {
    switch (typeString.toLowerCase()) {
      case 'book':
        return ContentType.BOOK;
      case 'article':
        return ContentType.ARTICLE;
      case 'video':
        return ContentType.VIDEO;
      case 'audio':
        return ContentType.AUDIO;
      case 'document':
        return ContentType.DOCUMENT;
      case 'other':
        return ContentType.OTHER;
      case 'website':
      default:
        return ContentType.WEBSITE;
    }
  };
  
  useEffect(() => {
    const fetchCurrentIndex = async () => {
      try {
        setLoading(true);
        
        // Get current cycle
        const cycleResponse = await fetch('/.netlify/functions/voting');
        const cycleData = await cycleResponse.json();
        const cycleId = cycleData.currentCycle.toString();
        setCurrentCycle(cycleId);
        
        // Get registry
        const registryResponse = await fetch('/.netlify/functions/ipfs-index-pointer');
        const registryData = await registryResponse.json();
        
        if (registryData.error) {
          setIndexItems([]);
          return;
        }
        
        const registryHash = registryData.indexHash;
        
        // Fetch registry from IPFS
        const registryFetchResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${registryHash}`);
        const registry = await registryFetchResponse.json();
        
        // Check if we have an index for the current cycle
        if (!registry.weeklyIndexes || !registry.weeklyIndexes[cycleId]) {
          setIndexItems([]);
          return;
        }
        
        // Fetch the weekly index
        const indexHash = registry.weeklyIndexes[cycleId];
        const indexFetchResponse = await fetch(`https://gateway.pinata.cloud/ipfs/${indexHash}`);
        const index = await indexFetchResponse.json();
        
        setIndexItems(index.items || []);
      } catch (err) {
        console.error('Failed to fetch index:', err);
        setError('Failed to load index data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentIndex();
  }, []);
  
  const convertToEvermark = (item: EvermarkIndexItem): Evermark => {
    return {
      id: item.id,
      title: item.title,
      author: item.author,
      description: item.description || null,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.createdAt),
      userId: item.owner,
      verified: false,
      metadata: {
        type: stringToContentType(item.contentType), // Convert to proper enum
        external_url: item.metadataURI,
        tags: item.tags || [],
        tokenId: item.id,
        voteCount: item.votes
      }
    };
  };
  
  if (loading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-warpcast mx-auto"></div>
        <p className="mt-4 text-ink-light font-serif">Loading this week's collection...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`bg-red-50 p-4 rounded-lg border border-red-200 text-red-800 font-serif ${className}`}>
        <p className="font-medium">Failed to load index</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }
  
  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-responsive-subtitle text-ink-dark font-serif">
        Weekly Collection {currentCycle && `(Cycle ${currentCycle})`}
      </h2>
      
      {indexItems.length === 0 ? (
        <div className="text-center py-12 bg-parchment-texture rounded-lg">
          <BookOpenIcon className="mx-auto h-12 w-12 text-wood opacity-60 mb-4" />
          <p className="text-ink-dark font-serif font-medium">No items in this week's collection</p>
          <p className="text-sm text-ink-light font-serif mt-1">Be the first to add an Evermark this week!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {indexItems.map((item) => (
            <CatalogCard key={item.id} evermark={convertToEvermark(item)} />
          ))}
        </div>
      )}
    </div>
  );
};