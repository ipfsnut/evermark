// src/services/blockchain/translation.ts
import { EvermarkMetadata, ContentType } from '../../types/evermark.types';

interface BookmarkContractData {
  title: string;
  contentCreator: string;
  metadataURI: string;
}

interface ContractEvermarkData {
  tokenId: string;
  title: string;
  contentCreator: string;
  metadataURI: string;
  creator: string;
  createdAt: number;
}

// Define valid method names as a union type
type EvermarkMethodName = 'createEvermark' | 'fetchEvermark' | 'updateEvermark' | 'getUserEvermarks';

// Define valid field names as union types
type EvermarkFieldName = 'author' | 'userId' | 'createdAt';
type ContractFieldName = 'contentCreator' | 'creator' | 'creationTime';

class ContractTranslationService {
  // Field mappings with proper types
  private readonly FIELD_MAPPINGS = {
    // Display → Contract
    toContract: {
      author: 'contentCreator',
      userId: 'creator',
      createdAt: 'creationTime',
    } as const,
    // Contract → Display
    fromContract: {
      contentCreator: 'author',
      creator: 'userId',
      creationTime: 'createdAt',
    } as const
  };

  // Method name mappings with proper types
  private readonly METHOD_MAPPINGS = {
    createEvermark: 'mintBookmark',
    fetchEvermark: 'getBookmark',
    updateEvermark: 'updateBookmark',
    getUserEvermarks: 'getUserBookmarks',
  } as const;

  /**
   * Prepare metadata for contract interaction
   */
  prepareContractMetadata(evermarkData: any): { 
    contractData: BookmarkContractData; 
    fullMetadata: EvermarkMetadata 
  } {
    // Create full metadata for IPFS
    const fullMetadata: EvermarkMetadata = {
      type: evermarkData.contentType || ContentType.WEBSITE,
      title: evermarkData.title,
      author: evermarkData.author || 'Unknown',
      description: evermarkData.description || null,
      external_url: evermarkData.external_url || evermarkData.sourceUrl,
      tags: evermarkData.tags || [],
      
      // Type-specific fields
      ...(evermarkData.isbn && { isbn: evermarkData.isbn }),
      ...(evermarkData.doi && { doi: evermarkData.doi }),
      ...(evermarkData.publisher && { publisher: evermarkData.publisher }),
      ...(evermarkData.publish_date && { publish_date: evermarkData.publish_date }),
      ...(evermarkData.language && { language: evermarkData.language }),
      ...(evermarkData.page_count && { page_count: evermarkData.page_count }),
      ...(evermarkData.journal && { journal: evermarkData.journal }),
      ...(evermarkData.site_name && { site_name: evermarkData.site_name }),
    };

    // Contract-ready data (simplified for blockchain)
    const contractData: BookmarkContractData = {
      title: evermarkData.title,
      contentCreator: evermarkData.author || 'Unknown',
      metadataURI: '', // Will be set after IPFS upload
    };

    return { contractData, fullMetadata };
  }

  /**
   * Translate contract response to Evermark format
   */
  translateFromContract(contractData: ContractEvermarkData, metadata?: EvermarkMetadata | null): any {
    const baseEvermark = {
      id: contractData.tokenId,
      title: contractData.title,
      author: contractData.contentCreator,
      userId: contractData.creator,
      createdAt: new Date(contractData.createdAt * 1000),
      updatedAt: new Date(contractData.createdAt * 1000),
      verified: false, // Could check on-chain verification
      metadataUri: contractData.metadataURI,
    };

    // If we have metadata from IPFS, merge it
    if (metadata) {
      return {
        ...baseEvermark,
        description: metadata.description,
        metadata: metadata,
      };
    }

    // Otherwise, create minimal metadata structure
    const defaultMetadata: EvermarkMetadata = {
      type: ContentType.WEBSITE,
      title: baseEvermark.title,
      author: baseEvermark.author,
      external_url: '',
      // Add any required fields from EvermarkMetadata
    };

    return {
      ...baseEvermark,
      metadata: defaultMetadata,
    };
  }

  /**
   * Get the contract method name for an Evermark operation
   */
  getContractMethod(evermarkMethod: EvermarkMethodName): string {
    return this.METHOD_MAPPINGS[evermarkMethod] || evermarkMethod;
  }

  /**
   * Translate field names for contract calls
   */
  translateFieldToContract(field: EvermarkFieldName): ContractFieldName | string {
    return this.FIELD_MAPPINGS.toContract[field] || field;
  }

  /**
   * Translate field names from contract responses
   */
  translateFieldFromContract(field: ContractFieldName): EvermarkFieldName | string {
    return this.FIELD_MAPPINGS.fromContract[field] || field;
  }

  /**
   * Prepare voting data for contract
   */
  prepareVotingData(evermarkId: string, amount: string) {
    return {
      bookmarkId: evermarkId,
      amount: amount,
    };
  }

  /**
   * Translate voting results from contract
   */
  translateVotingResults(contractResults: any) {
    return {
      evermarkId: contractResults.bookmarkId,
      votes: contractResults.votes,
      rank: contractResults.rank,
      // Add more translations as needed
    };
  }

  /**
   * Prepare auction data for contract
   */
  prepareAuctionData(evermarkId: string, auctionParams: any) {
    return {
      tokenId: evermarkId,
      nftContract: process.env.VITE_BOOKMARK_NFT_ADDRESS, // Using bookmark NFT address
      startingPrice: auctionParams.startingPrice,
      reservePrice: auctionParams.reservePrice,
      duration: auctionParams.duration,
    };
  }

  /**
   * Translate auction results from contract
   */
  translateAuctionResults(contractResults: any) {
    return {
      auctionId: contractResults.auctionId,
      evermarkId: contractResults.tokenId,
      startingPrice: contractResults.startingPrice,
      currentBid: contractResults.currentBid,
      highestBidder: contractResults.highestBidder,
      endTime: new Date(contractResults.endTime * 1000),
      // Add more translations as needed
    };
  }

  /**
   * Prepare leaderboard query for contract
   */
  prepareLeaderboardQuery(weekNumber: number) {
    return {
      weekNumber,
      count: 10, // Default top 10
    };
  }

  /**
   * Translate leaderboard results from contract
   */
  translateLeaderboardResults(contractResults: any[]) {
    return contractResults.map(result => ({
      evermarkId: result.tokenId,
      title: result.title,
      author: result.creator,
      votes: result.votes,
      rank: result.rank,
    }));
  }
}

export const translationService = new ContractTranslationService();