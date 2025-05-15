// src/hooks/useAuctions.ts
import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { contractService } from '../services/blockchain';
import { errorLogger } from '../utils/error-logger';
import { AuctionData } from '../types/blockchain.types';

export function useAuctions() {
  const { address, isConnected } = useAccount();
  const [activeAuctions, setActiveAuctions] = useState<string[]>([]);
  const [auctionDetails, setAuctionDetails] = useState<Map<string, AuctionData>>(new Map());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Fetch active auctions
  const fetchActiveAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const auctions = await contractService.getActiveAuctions();
      setActiveAuctions(auctions);
      
      // Fetch details for each auction
      const detailsMap = new Map<string, AuctionData>();
      for (const auctionId of auctions) {
        const details = await contractService.getAuctionDetails(auctionId);
        if (details) {
          detailsMap.set(auctionId, details);
        }
      }
      setAuctionDetails(detailsMap);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch auctions';
      errorLogger.log('useAuctions', err, { method: 'fetchActiveAuctions' });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Get auction details
  const getAuctionDetails = useCallback(async (auctionId: string) => {
    // Check if we already have the details
    if (auctionDetails.has(auctionId)) {
      return auctionDetails.get(auctionId);
    }
    
    try {
      const details = await contractService.getAuctionDetails(auctionId);
      if (details) {
        // Update the details map
        setAuctionDetails(prev => new Map(prev).set(auctionId, details));
      }
      return details;
    } catch (err: any) {
      errorLogger.log('useAuctions', err, { method: 'getAuctionDetails', auctionId });
      return null;
    }
  }, [auctionDetails]);
  
  // Create auction
  const createAuction = useCallback(async (
    nftContract: string,
    tokenId: string,
    startingPrice: string,
    reservePrice: string,
    duration: number
  ) => {
    if (!address) return false;
    
    setActionLoading(true);
    setActionError(null);
    
    try {
      const { wait } = await contractService.createAuction(
        nftContract,
        tokenId,
        startingPrice,
        reservePrice,
        duration
      );
      await wait();
      
      // Refresh auctions
      await fetchActiveAuctions();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create auction';
      errorLogger.log('useAuctions', err, {
        method: 'createAuction',
        nftContract,
        tokenId,
        startingPrice,
        reservePrice,
        duration
      });
      setActionError(errorMessage);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [address, fetchActiveAuctions]);
  
  // Place bid
  const placeBid = useCallback(async (auctionId: string, amount: string) => {
    if (!address) return false;
    
    setActionLoading(true);
    setActionError(null);
    
    try {
      const { wait } = await contractService.placeBid(auctionId, amount);
      await wait();
      
      // Refresh auction details
      await getAuctionDetails(auctionId);
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to place bid';
      errorLogger.log('useAuctions', err, { method: 'placeBid', auctionId, amount });
      setActionError(errorMessage);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [address, getAuctionDetails]);
  
  // Finalize auction
  const finalizeAuction = useCallback(async (auctionId: string) => {
    if (!address) return false;
    
    setActionLoading(true);
    setActionError(null);
    
    try {
      const { wait } = await contractService.finalizeAuction(auctionId);
      await wait();
      
      // Refresh auctions
      await fetchActiveAuctions();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to finalize auction';
      errorLogger.log('useAuctions', err, { method: 'finalizeAuction', auctionId });
      setActionError(errorMessage);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [address, fetchActiveAuctions]);
  
  // Cancel auction
  const cancelAuction = useCallback(async (auctionId: string) => {
    if (!address) return false;
    
    setActionLoading(true);
    setActionError(null);
    
    try {
      const { wait } = await contractService.cancelAuction(auctionId);
      await wait();
      
      // Refresh auctions
      await fetchActiveAuctions();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to cancel auction';
      errorLogger.log('useAuctions', err, { method: 'cancelAuction', auctionId });
      setActionError(errorMessage);
      return false;
    } finally {
      setActionLoading(false);
    }
  }, [address, fetchActiveAuctions]);
  
  return {
    activeAuctions,
    auctionDetails,
    loading,
    error,
    actionLoading,
    actionError,
    fetchActiveAuctions,
    getAuctionDetails,
    createAuction,
    placeBid,
    finalizeAuction,
    cancelAuction,
  };
}