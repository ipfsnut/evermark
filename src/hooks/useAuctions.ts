// src/hooks/useAuctions.ts
import { useState, useEffect, useCallback } from 'react';
import { evermarkAuctionService, EvermarkAuctionData } from '../services/blockchain';
import { useAuth } from './useAuth';
import { ethers } from 'ethers';

export function useAuctions() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAuctions, setActiveAuctions] = useState<string[]>([]);
  const [auctionDetails, setAuctionDetails] = useState<{ [auctionId: string]: EvermarkAuctionData }>({});
  const { user } = useAuth();

  // Fetch active auctions
  const fetchActiveAuctions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const auctions = await evermarkAuctionService.getActiveAuctions();
      setActiveAuctions(auctions);
      return auctions;
    } catch (err: any) {
      console.error('Failed to fetch active auctions:', err);
      setError('Failed to fetch active auctions');
      setActiveAuctions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch auction details
  const fetchAuctionDetails = useCallback(async (auctionId: string) => {
    try {
      const details = await evermarkAuctionService.getAuctionDetails(auctionId);
      
      if (details) {
        setAuctionDetails(prev => ({
          ...prev,
          [auctionId]: details
        }));
      }
      
      return details;
    } catch (err: any) {
      console.error(`Failed to fetch auction details for ${auctionId}:`, err);
      return null;
    }
  }, []);

  // Create new auction
  const createAuction = useCallback(async (
    nftContract: string,
    tokenId: string,
    startingPrice: string,
    reservePrice: string,
    duration: number
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await evermarkAuctionService.createAuction(
        nftContract,
        tokenId,
        startingPrice,
        reservePrice,
        duration
      );
      
      // Refresh auctions after creation
      await fetchActiveAuctions();
      return result;
    } catch (err: any) {
      console.error('Failed to create auction:', err);
      setError(`Failed to create auction: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchActiveAuctions]);

  // Place bid on auction
  const placeBid = useCallback(async (auctionId: string, amount: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await evermarkAuctionService.placeBid(auctionId, amount);
      
      // Refresh auction details after bid
      await fetchAuctionDetails(auctionId);
      return result;
    } catch (err: any) {
      console.error(`Failed to place bid on auction ${auctionId}:`, err);
      setError(`Failed to place bid: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchAuctionDetails]);

  // Finalize auction
  const finalizeAuction = useCallback(async (auctionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await evermarkAuctionService.finalizeAuction(auctionId);
      
      // Refresh auctions after finalization
      await fetchActiveAuctions();
      return result;
    } catch (err: any) {
      console.error(`Failed to finalize auction ${auctionId}:`, err);
      setError(`Failed to finalize auction: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchActiveAuctions]);

  // Cancel auction
  const cancelAuction = useCallback(async (auctionId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await evermarkAuctionService.cancelAuction(auctionId);
      
      // Refresh auctions after cancellation
      await fetchActiveAuctions();
      return result;
    } catch (err: any) {
      console.error(`Failed to cancel auction ${auctionId}:`, err);
      setError(`Failed to cancel auction: ${err.message}`);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchActiveAuctions]);

  // Format ether for display
  const formatEther = useCallback((value: bigint | string): string => {
    try {
      return ethers.formatEther(value);
    } catch (error) {
      return '0';
    }
  }, []);

  // Initialize with active auctions
  useEffect(() => {
    fetchActiveAuctions();
  }, [fetchActiveAuctions]);

  return {
    loading,
    error,
    activeAuctions,
    auctionDetails,
    fetchActiveAuctions,
    fetchAuctionDetails,
    createAuction,
    placeBid,
    finalizeAuction,
    cancelAuction,
    formatEther
  };
}