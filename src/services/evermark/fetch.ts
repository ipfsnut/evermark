import { contractService } from '../blockchain';
import { storageService } from '../storage';

export const fetchEvermark = async (tokenId: string) => {
  try {
    // First try blockchain
    const { exists, tokenURI, owner } = await contractService.getEvermark(tokenId);
    
    if (!exists) {
      return null;
    }
    
    // Fetch full data
    const evermark = await storageService.getEvermarkData(tokenId);
    
    if (evermark) {
      return { ...evermark, owner };
    }
    
    return null;
  } catch (error: any) {
    throw new Error(`Failed to fetch evermark: ${error.message}`);
  }
};