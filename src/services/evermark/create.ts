import { CreateEvermarkInput, Evermark } from '../../types/evermark';
import { contractService } from '../blockchain';
import { storageService } from '../storage';

export const createEvermark = async (input: CreateEvermarkInput): Promise<Evermark> => {
  try {
    // 1. Extract/create metadata
    const metadata = {
      title: input.manualData?.title || 'Untitled',
      author: input.manualData?.author || 'Unknown',
      content_type: input.contentType,
      description: input.manualData?.description,
      external_url: input.sourceUrl,
      ...input.manualData,
    };
    
    // 2. Upload to IPFS
    const metadataUri = await storageService.ipfsService.uploadJSON(metadata);
    
    // 3. Mint NFT
    const { hash, wait } = await contractService.mintEvermark(metadata.owner, metadataUri);
    
    // 4. Wait for transaction
    await wait();
    
    // 5. Save to database
    const evermark = await storageService.saveEvermarkData(metadata, 'token_id', metadata.owner);
    
    return evermark;
  } catch (error: any) {
    throw new Error(`Failed to create evermark: ${error.message}`);
  }
};