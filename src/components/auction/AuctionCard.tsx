// src/components/auction/AuctionCard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuctions } from '../../hooks/useAuctions';
import { useEvermarks } from '../../hooks/useEvermarks';
import { useAuth } from '../../hooks/useAuth';
import { 
  ExternalLinkIcon, 
  ClockIcon, 
  DollarSignIcon, 
  UserIcon,
  TagIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  HammerIcon
} from 'lucide-react';
import { StyledButton } from '../forms/StyledButton';
import { StyledInput } from '../forms/StyledInput';

interface AuctionCardProps {
  auctionId: string;
}

export const AuctionCard: React.FC<AuctionCardProps> = ({ auctionId }) => {
  const { fetchAuctionDetails, auctionDetails, placeBid, formatEther, loading } = useAuctions();
  const { fetchEvermark } = useEvermarks();
  const { isAuthenticated, user } = useAuth();
  
  const [evermark, setEvermark] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState<string>('');
  const [bidLoading, setBidLoading] = useState<boolean>(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  // Fetch auction details
  useEffect(() => {
    const loadAuctionDetails = async () => {
      const details = await fetchAuctionDetails(auctionId);
      
      if (details && details.tokenId) {
        // Also fetch the evermark info
        try {
          const evermarkData = await fetchEvermark(details.tokenId);
          setEvermark(evermarkData);
        } catch (error) {
          console.error('Failed to fetch evermark details:', error);
        }
      }
    };
    
    loadAuctionDetails();
  }, [auctionId, fetchAuctionDetails, fetchEvermark]);
  
  // Calculate and update time remaining
  useEffect(() => {
    const auction = auctionDetails?.[auctionId];
    if (!auction) return;
    
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = auction.endTime;
      
      if (endTime <= now) {
        setTimeLeft('Auction ended');
        return;
      }
      
      const secondsLeft = endTime - now;
      const days = Math.floor(secondsLeft / 86400);
      const hours = Math.floor((secondsLeft % 86400) / 3600);
      const minutes = Math.floor((secondsLeft % 3600) / 60);
      const seconds = secondsLeft % 60;
      
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m remaining`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s remaining`);
      } else {
        setTimeLeft(`${seconds}s remaining`);
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [auctionId, auctionDetails]);
  
  // Handle bid submission
  const handleBid = async () => {
    if (!bidAmount) return;
    
    setBidLoading(true);
    setBidError(null);
    setBidSuccess(false);
    
    try {
      await placeBid(auctionId, bidAmount);
      setBidSuccess(true);
      setBidAmount('');
      
      // Refresh auction details
      await fetchAuctionDetails(auctionId);
    } catch (error: any) {
      setBidError(error.message || 'Failed to place bid');
    } finally {
      setBidLoading(false);
    }
  };
  
  // Early rendering states
  if (loading) {
    return (
      <div className="card animate-pulse p-6 h-80">
        <div className="h-6 bg-wood-light/20 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-wood-light/20 rounded w-full mb-2"></div>
        <div className="h-4 bg-wood-light/20 rounded w-5/6 mb-8"></div>
        <div className="h-12 bg-wood-light/20 rounded w-full mb-4"></div>
        <div className="h-10 bg-wood-light/20 rounded w-full"></div>
      </div>
    );
  }
  
  // Get auction data
  const auction = auctionDetails?.[auctionId];
  
  if (!auction) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center text-ink-light">
          <AlertCircleIcon className="w-6 h-6 mr-2 text-amber-500" />
          <p className="font-serif">Auction details not available</p>
        </div>
      </div>
    );
  }
  
  const isOwner = user?.walletAddress?.toLowerCase() === auction.seller.toLowerCase();
  const isHighestBidder = user?.walletAddress?.toLowerCase() === auction.highestBidder.toLowerCase();
  const hasActiveBid = BigInt(auction.currentBid) > BigInt(0);
  const isFinalized = auction.finalized;
  const isEnded = auction.endTime < Math.floor(Date.now() / 1000);
  
  return (
    <div className="card p-6 relative overflow-hidden">
      {/* Corner fold decoration */}
      <div className="card-corner-fold"></div>
      
      {/* Auction status badges */}
      {isFinalized && (
        <div className="absolute top-4 right-6 border-2 rounded-md px-2 py-1 text-xs font-bold tracking-wider text-green-700 border-green-700 -rotate-12">
          FINALIZED
        </div>
      )}
      
      {isEnded && !isFinalized && (
        <div className="absolute top-4 right-6 border-2 rounded-md px-2 py-1 text-xs font-bold tracking-wider text-amber-700 border-amber-700 -rotate-12">
          ENDED
        </div>
      )}
      
      {/* Evermark info */}
      <div className="mb-4">
        <Link 
          to={`/evermark/${auction.tokenId}`}
          className="text-responsive-card-title text-ink-dark hover:text-warpcast transition-colors group"
        >
          {evermark?.title || `Evermark #${auction.tokenId}`}
          <ExternalLinkIcon className="w-4 h-4 inline-block ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        
        {evermark && (
          <div className="flex items-center mt-1 text-ink-light">
            <UserIcon className="w-3.5 h-3.5 mr-1.5 text-brass-dark" />
            <p className="text-sm font-serif">
              {evermark.author}
            </p>
          </div>
        )}
        
        {evermark?.description && (
          <p className="mt-2 text-sm line-clamp-2">
            {evermark.description}
          </p>
        )}
        
        {/* Tags */}
        {evermark?.metadata?.tags && evermark.metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {evermark.metadata.tags.slice(0, 2).map((tag: string) => (
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
      </div>
      
      {/* Auction details */}
      <div className="border-t border-wood-light/20 pt-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-parchment-light rounded-lg p-3 text-center">
            <p className="text-xs text-ink-light font-serif mb-1">Current Bid</p>
            <p className="text-xl font-medium text-ink-dark font-mono">{formatEther(auction.currentBid)} ETH</p>
            {auction.highestBidder !== '0x0000000000000000000000000000000000000000' && (
              <p className="text-xs text-ink-light font-serif mt-1">
                by {auction.highestBidder.slice(0, 6)}...{auction.highestBidder.slice(-4)}
              </p>
            )}
          </div>
          
          <div className="bg-parchment-light rounded-lg p-3 text-center">
            <p className="text-xs text-ink-light font-serif mb-1">Reserve Price</p>
            <p className="text-xl font-medium text-ink-dark font-mono">{formatEther(auction.reservePrice)} ETH</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-ink-light">
            <ClockIcon className="w-4 h-4 mr-1.5" />
            <span>{timeLeft}</span>
          </div>
          
          <div className="flex items-center text-sm text-ink-light">
            <UserIcon className="w-4 h-4 mr-1.5" />
            <span>Seller: {auction.seller.slice(0, 6)}...{auction.seller.slice(-4)}</span>
          </div>
        </div>
      </div>
      
      {/* Bidding section */}
      {!isFinalized && !isEnded && !isOwner && isAuthenticated && (
        <div className="border-t border-wood-light/20 pt-4">
          <div className="flex gap-3">
            <StyledInput
              id="bid-amount"
              label=""
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              placeholder={`Min bid: ${formatEther(
                hasActiveBid 
                  ? BigInt(auction.currentBid) + BigInt('10000000000000000') // +0.01 ETH
                  : auction.startingPrice
              )} ETH`}
              containerClassName="flex-1"
            />
            
            <StyledButton
              onClick={handleBid}
              disabled={
                bidLoading || 
                !bidAmount ||
                isOwner ||
                isFinalized ||
                isEnded
              }
              isLoading={bidLoading}
              variant="primary"
              icon={<HammerIcon className="h-4 w-4" />}
              className="mt-auto"
            >
              Place Bid
            </StyledButton>
          </div>
          
          {/* Bid response messages */}
          {bidError && (
            <div className="mt-2 text-red-600 text-sm flex items-center">
              <AlertCircleIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span>{bidError}</span>
            </div>
          )}
          
          {bidSuccess && (
            <div className="mt-2 text-green-600 text-sm flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span>Bid placed successfully!</span>
            </div>
          )}
          
          {isHighestBidder && (
            <div className="mt-2 text-green-600 text-sm flex items-center">
              <CheckCircleIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
              <span>You are the highest bidder!</span>
            </div>
          )}
        </div>
      )}
      
      {/* Special messages */}
      {isOwner && (
        <div className="border-t border-wood-light/20 pt-4 text-center font-serif text-ink-light">
          You are the seller of this auction
        </div>
      )}
      
      {isFinalized && (
        <div className="border-t border-wood-light/20 pt-4 text-center font-serif">
          {isHighestBidder ? (
            <span className="text-green-600">You won this auction!</span>
          ) : (
            <span className="text-ink-light">This auction has been finalized</span>
          )}
        </div>
      )}
      
      {isEnded && !isFinalized && (
        <div className="border-t border-wood-light/20 pt-4 text-center font-serif text-amber-600">
          Auction ended, awaiting finalization
        </div>
      )}
      
      {!isAuthenticated && (
        <div className="border-t border-wood-light/20 pt-4 text-center font-serif text-ink-light">
          Connect your wallet to place a bid
        </div>
      )}
    </div>
  );
};