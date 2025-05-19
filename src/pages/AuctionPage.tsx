// src/pages/AuctionPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuctions } from '../hooks/useAuctions';
import { useAuth } from '../hooks/useAuth';
import { PageContainer } from '../components/layout/PageContainer';
import { AuctionCard } from '../components/auction/AuctionCard';
import { Link } from 'react-router-dom';
import { 
  DollarSignIcon, 
  AlertCircleIcon, 
  BookOpenIcon, 
  PlusIcon,
  ArrowDownUpIcon,  // Changed from SortIcon
  ClockIcon
} from 'lucide-react';
import { StyledButton } from '../components/forms/StyledButton';
import { StyledSelect } from '../components/forms/StyledSelect';

const AuctionPage: React.FC = () => {
  const { activeAuctions, fetchActiveAuctions, auctionDetails, fetchAuctionDetails, loading, error } = useAuctions();
  const { isAuthenticated } = useAuth();
  const [sortBy, setSortBy] = useState<'endingSoon' | 'highestBid' | 'newest'>('endingSoon');
  const [isLoading, setIsLoading] = useState(true);
  
  // Initial fetch of active auctions
  useEffect(() => {
    const fetchAuctions = async () => {
      setIsLoading(true);
      await fetchActiveAuctions();
      setIsLoading(false);
    };
    
    fetchAuctions();
  }, [fetchActiveAuctions]);
  
  // Fetch details for each auction
  useEffect(() => {
    const loadAuctionDetails = async () => {
      if (!activeAuctions.length) return;
      
      // Load auction details in parallel
      await Promise.all(
        activeAuctions.map(auctionId => fetchAuctionDetails(auctionId))
      );
    };
    
    loadAuctionDetails();
  }, [activeAuctions, fetchAuctionDetails]);
  
  // Sort auctions based on selected sorting method
  const sortedAuctions = [...activeAuctions].sort((a, b) => {
    // Get details for both auctions
    const detailsA = auctionDetails[a];
    const detailsB = auctionDetails[b];
    
    // If details aren't loaded yet, keep original order
    if (!detailsA || !detailsB) return 0;
    
    switch (sortBy) {
      case 'endingSoon':
        return detailsA.endTime - detailsB.endTime;
      case 'highestBid':
        return Number(detailsB.currentBid) - Number(detailsA.currentBid);
      case 'newest':
        return detailsB.startTime - detailsA.startTime;
      default:
        return 0;
    }
  });
  
  // Not authenticated state
  if (!isAuthenticated) {
    return (
      <PageContainer
        title="Evermark Auctions"
        description="Buy and sell unique Evermarks through our marketplace"
        icon={<DollarSignIcon className="h-7 w-7 text-warpcast" />}
      >
        <div className="text-center py-12 bg-parchment-texture rounded-lg">
          <BookOpenIcon className="mx-auto h-12 w-12 text-wood opacity-60 mb-4" />
          <h3 className="text-responsive-card-title text-ink-dark font-serif">Connect Your Wallet</h3>
          <p className="mt-2 text-sm font-serif text-ink-light leading-relaxed tracking-wide max-w-md mx-auto">
            Please connect your wallet to view and participate in Evermark auctions.
          </p>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer
      title="Evermark Auctions"
      description="Buy and sell unique Evermarks through our marketplace"
      icon={<DollarSignIcon className="h-7 w-7 text-warpcast" />}
    >
      {/* Top controls - Create auction button and sorting */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <StyledButton
          variant="primary"
          icon={<PlusIcon className="h-4 w-4" />}
        >
          Create Auction
        </StyledButton>
        
        <div className="flex items-center">
          <ArrowDownUpIcon className="h-4 w-4 mr-2 text-ink-light" />
          <StyledSelect
            id="sort-by"
            label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            options={[
              { value: 'endingSoon', label: 'Ending Soon' },
              { value: 'highestBid', label: 'Highest Bid' },
              { value: 'newest', label: 'Newest First' }
            ]}
            containerClassName="w-48 mb-0"
            labelClassName="sr-only" // Hide label visually but keep for screen readers
          />
        </div>
      </div>
      
      {/* Loading State */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-t-warpcast border-r-warpcast/30 border-b-warpcast/10 border-l-warpcast/70 animate-spin"></div>
            <DollarSignIcon className="absolute inset-0 m-auto w-6 h-6 text-warpcast-light" />
          </div>
          <p className="text-ink-light font-serif">Loading auctions...</p>
        </div>
      ) : error ? (
        /* Error State */
        <div className="bg-red-50 rounded-lg p-6 border border-red-200 text-center">
          <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-responsive-card-title text-red-700 font-serif mb-2">Error Loading Auctions</h3>
          <p className="text-red-600 font-serif">{error}</p>
          <StyledButton
            onClick={() => fetchActiveAuctions()}
            variant="primary"
            className="mt-4"
          >
            Try Again
          </StyledButton>
        </div>
      ) : sortedAuctions.length > 0 ? (
        /* Auctions Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAuctions.map((auctionId, index) => (
            <div key={auctionId} className="animate-text-in" style={{animationDelay: `${index * 0.1}s`}}>
              <AuctionCard auctionId={auctionId} />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 bg-parchment-texture rounded-lg">
          <BookOpenIcon className="mx-auto h-12 w-12 text-wood opacity-60 mb-4" />
          <h3 className="text-responsive-card-title text-ink-dark font-serif">No Active Auctions</h3>
          <p className="mt-2 text-sm font-serif text-ink-light leading-relaxed tracking-wide max-w-md mx-auto">
            There are currently no active auctions in the marketplace. Create your own auction or check back later.
          </p>
          <StyledButton
            variant="primary"
            icon={<PlusIcon className="h-4 w-4" />}
            className="mt-6"
          >
            Create Your First Auction
          </StyledButton>
        </div>
      )}
      
      {/* Active Auction Tips */}
      {sortedAuctions.length > 0 && (
        <div className="mt-10 p-5 bg-parchment-texture rounded-lg border border-wood-light/30 shadow-sm animate-text-in">
          <h3 className="text-sm font-serif font-medium text-ink-dark mb-3 flex items-center">
            <ClockIcon className="h-4 w-4 mr-2 text-warpcast" />
            Auction Tips:
          </h3>
          
          <ul className="space-y-2 text-sm font-serif text-ink-light">
            <li className="flex items-start">
              <span className="mr-2 text-warpcast">•</span>
              <span>Auctions end at the time shown on each card</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-warpcast">•</span>
              <span>Place bids higher than the current highest bid plus minimum increment</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-warpcast">•</span>
              <span>Once an auction ends, it must be finalized for the transfer to complete</span>
            </li>
          </ul>
        </div>
      )}
    </PageContainer>
  );
};

export default AuctionPage;