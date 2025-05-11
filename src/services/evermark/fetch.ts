// src/services/evermark/fetch.ts
import { contractService } from '../blockchain/contracts';
import { ipfsService } from '../storage/ipfs';
import { databaseService } from '../storage/database';
import { translationService } from '../blockchain/translation';
import { Evermark } from '../../types/evermark.types';

export const fetchEvermark = async (tokenId: string): Promise<Evermark | null> => {
  try {
    // 1. Try to get from blockchain first (source of truth)
    const contractData = await contractService.getEvermark(tokenId);
    
    if (!contractData.exists) {
      return null;
    }
    
    // 2. Fetch metadata from IPFS if available
    let metadata = null;
    if (contractData.metadataURI && ipfsService.isAvailable()) {
      try {
        metadata = await ipfsService.fetchJSON(contractData.metadataURI);
      } catch (ipfsError) {
        console.warn('Failed to fetch metadata from IPFS:', ipfsError);
        // Continue without metadata
      }
    }
    
    // 3. Try to get additional data from database
    let dbEvermark = null;
    try {
      // Search by token ID or metadata URI
      dbEvermark = await databaseService.getEvermark(tokenId);
      if (!dbEvermark) {
        // Try searching by metadata URI
        // This would require an additional method in databaseService
        // For now, we'll skip this fallback
      }
    } catch (dbError) {
      console.warn('Failed to fetch from database:', dbError);
      // Continue without database data
    }
    
    // 4. Translate contract data to Evermark format
    const evermark = translationService.translateFromContract(
      {
        tokenId,
        title: contractData.title || 'Untitled',
        contentCreator: contractData.author || 'Unknown',
        metadataURI: contractData.metadataURI || '',
        creator: contractData.owner || '',
        createdAt: Date.now() / 1000, // Approximate since we don't have this from contract
      },
      metadata
    );
    
    // 5. Merge with database data if available
    if (dbEvermark) {
      return {
        ...evermark,
        id: dbEvermark.id,
        description: dbEvermark.description,
        userId: dbEvermark.userId,
        verified: dbEvermark.verified,
        createdAt: dbEvermark.createdAt,
        updatedAt: dbEvermark.updatedAt,
      };
    }
    
    // 6. Return blockchain + IPFS data
    return evermark;
    
  } catch (error: any) {
    console.error('Fetch evermark failed:', error);
    throw new Error(`Failed to fetch evermark: ${error.message}`);
  }
};

// Function to list evermarks (for a user or all)
export const listEvermarks = async (userAddress?: string): Promise<Evermark[]> => {
  try {
    let tokenIds: string[] = [];
    
    if (userAddress) {
      // Get user's evermarks from contract
      tokenIds = await contractService.getUserEvermarks(userAddress);
    } else {
      // For now, we'll rely on database for listing all evermarks
      // Blockchain doesn't provide a good way to list all tokens
      const dbEvermarks = await databaseService.getAllEvermarks(50, 0);
      
      // Extract token IDs from database results
      tokenIds = dbEvermarks
        .map(evermark => evermark.metadata?.tokenId)
        .filter((id): id is string => !!id);
    }
    
    // Fetch details for each token
    const evermarks: Evermark[] = [];
    for (const tokenId of tokenIds) {
      try {
        const evermark = await fetchEvermark(tokenId);
        if (evermark) {
          evermarks.push(evermark);
        }
      } catch (error) {
        console.warn(`Failed to fetch evermark ${tokenId}:`, error);
        continue;
      }
    }
    
    return evermarks;
    
  } catch (error: any) {
    console.error('List evermarks failed:', error);
    throw new Error(`Failed to list evermarks: ${error.message}`);
  }
};