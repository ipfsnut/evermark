export { ipfsService } from './ipfs';
export { databaseService, supabase } from './database';

// Combined storage service for convenience
export const storageService = {
  // Upload and save evermark data
  async saveEvermarkData(metadata: any, tokenId: string, owner: string) {
    // 1. Upload metadata to IPFS
    const metadataUri = await ipfsService.uploadJSON(metadata, `evermark-${tokenId}`);
    
    // 2. Save to database
    const evermark = await databaseService.saveEvermark({
      tokenId,
      metadataUri,
      owner,
      metadata,
    });
    
    return evermark;
  },
  
  // Get complete evermark data
  async getEvermarkData(tokenId: string) {
    // 1. Get from database
    const evermark = await databaseService.getEvermarkByTokenId(tokenId);
    
    if (!evermark) {
      return null;
    }
    
    // 2. Fetch metadata from IPFS
    try {
      const metadata = await ipfsService.fetchJSON(evermark.metadataUri);
      return { ...evermark, metadata };
    } catch (error) {
      console.error('Failed to fetch metadata from IPFS:', error);
      // Return database version as fallback
      return evermark;
    }
  },
};