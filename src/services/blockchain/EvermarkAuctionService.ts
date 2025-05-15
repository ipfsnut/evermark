// src/services/blockchain/EvermarkAuctionService.ts

import { ethers } from 'ethers';
import { BaseContractService } from './BaseContractService';
import { CONTRACT_ADDRESSES } from '../../config/constants';
import BookmarkAuctionABI from '../../config/abis/BookmarkAuction.json';
import { errorLogger } from '../../utils/error-logger';

// Type definitions
export interface EvermarkAuctionData {
  tokenId: string;
  nftContract: string;
  seller: string;
  startingPrice: bigint;
  reservePrice: bigint;
  currentBid: bigint;
  highestBidder: string;
  startTime: number;
  endTime: number;
  finalized: boolean;
}

export class EvermarkAuctionService extends BaseContractService {
  /**
   * Create auction
   */
  async createAuction(
    nftContract: string,
    tokenId: string,
    startingPrice: string,
    reservePrice: string,
    duration: number
  ) {
    try {
      const signer = await this.getSigner();
      
      const auctionContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_AUCTION,
        BookmarkAuctionABI,
        signer
      );
      
      const startingPriceWei = ethers.parseEther(startingPrice);
      const reservePriceWei = ethers.parseEther(reservePrice);
      
      const tx = await auctionContract.createAuction(
        nftContract,
        tokenId,
        startingPriceWei,
        reservePriceWei,
        duration
      );
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('evermarkAuctionService', error, { 
        method: 'createAuction', 
        nftContract, 
        tokenId,
        startingPrice,
        reservePrice,
        duration
      });
      throw new Error(`Failed to create auction: ${error.message}`);
    }
  }
  
  /**
   * Place bid
   */
  async placeBid(auctionId: string, amount: string) {
    try {
      const signer = await this.getSigner();
      
      const auctionContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_AUCTION,
        BookmarkAuctionABI,
        signer
      );
      
      const amountWei = ethers.parseEther(amount);
      
      const tx = await auctionContract.placeBid(auctionId, { value: amountWei });
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('evermarkAuctionService', error, { method: 'placeBid', auctionId, amount });
      throw new Error(`Failed to place bid: ${error.message}`);
    }
  }
  
  /**
   * Finalize auction
   */
  async finalizeAuction(auctionId: string) {
    try {
      const signer = await this.getSigner();
      
      const auctionContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_AUCTION,
        BookmarkAuctionABI,
        signer
      );
      
      const tx = await auctionContract.finalizeAuction(auctionId);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('evermarkAuctionService', error, { method: 'finalizeAuction', auctionId });
      throw new Error(`Failed to finalize auction: ${error.message}`);
    }
  }
  
  /**
   * Cancel auction
   */
  async cancelAuction(auctionId: string) {
    try {
      const signer = await this.getSigner();
      
      const auctionContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_AUCTION,
        BookmarkAuctionABI,
        signer
      );
      
      const tx = await auctionContract.cancelAuction(auctionId);
      
      return {
        hash: tx.hash,
        wait: () => tx.wait(),
      };
    } catch (error: any) {
      errorLogger.log('evermarkAuctionService', error, { method: 'cancelAuction', auctionId });
      throw new Error(`Failed to cancel auction: ${error.message}`);
    }
  }
  
  /**
   * Get auction details
   */
  async getAuctionDetails(auctionId: string): Promise<EvermarkAuctionData | null> {
    try {
      const auctionContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_AUCTION,
        BookmarkAuctionABI
      );

      try {
        return await this.callContract<EvermarkAuctionData>(
          auctionContract, 
          'getAuctionDetails', 
          [auctionId],
          { cache: true, cacheTime: 60000 } // 1 minute
        );
      } catch (innerError) {
        errorLogger.log('evermarkAuctionService', innerError, { method: 'getAuctionDetails:inner' });
        return null;
      }
    } catch (error) {
      errorLogger.log('evermarkAuctionService', error, { method: 'getAuctionDetails', auctionId });
      return null;
    }
  }
  
  /**
   * Get active auctions
   */
  async getActiveAuctions(): Promise<string[]> {
    try {
      const auctionContract = this.getContract(
        CONTRACT_ADDRESSES.BOOKMARK_AUCTION,
        BookmarkAuctionABI
      );

      try {
        return await this.callContract<string[]>(
          auctionContract, 
          'getActiveAuctions', 
          [],
          { cache: true, cacheTime: 60000 } // 1 minute
        );
      } catch (innerError) {
        errorLogger.log('evermarkAuctionService', innerError, { method: 'getActiveAuctions:inner' });
        return [];
      }
    } catch (error) {
      errorLogger.log('evermarkAuctionService', error, { method: 'getActiveAuctions' });
      return [];
    }
  }
}

// Export a singleton instance
export const evermarkAuctionService = new EvermarkAuctionService();
