import { ipfsService } from './ipfs'; // Make sure this path is correct
import { databaseService } from './database';

// Combined storage service for convenience
export const storageService = {
  // Upload and save evermark data
  async saveEvermarkData(metadata: any, tokenId: string, owner: string) {
    // 1. Upload metadata to IPFS
    const metadataUri = await ipfsService.uploadJSON(metadata, `evermark-${tokenId}`);
    
    // 2. Save to local database
    const evermark = await databaseService.saveEvermark({
      id: tokenId,
      title: metadata.title || 'Untitled',
      author: metadata.author || 'Unknown',
      description: metadata.description || null,
      userId: owner,
      verified: false,
      metadata: {
        ...metadata,
        tokenId,
        metadataUri,
        owner
      },
    });
    
    return evermark;
  },
  
  // Get complete evermark data
  async getEvermarkData(tokenId: string) {
    // 1. Get from database
    const evermark = await databaseService.getEvermark(tokenId);
    
    if (!evermark) {
      return null;
    }
    
    // 2. Fetch metadata from IPFS if needed
    if (evermark.metadata?.metadataUri && !evermark.metadata.title) {
      try {
        const metadata = await ipfsService.fetchJSON(evermark.metadata.metadataUri);
        return { 
          ...evermark, 
          metadata: {
            ...evermark.metadata,
            ...metadata
          }
        };
      } catch (error) {
        console.error('Failed to fetch metadata from IPFS:', error);
      }
    }
    
    return evermark;
  },
};

// Re-export
export { ipfsService, databaseService };